/**
 * Scheduler — pengisian slot harian + catch-up (FR-18).
 * 5 slot per kanal: default 10:00/13:00/17:00/20:00/23:00 UTC + offset per kanal.
 */
import { db } from "@/lib/db";
import { antre } from "@/lib/antre";
import { menitUtcToDate } from "@/lib/waktu";

/**
 * Isi slot jadwal untuk hari ini.
 * Ambil paket yang butuh jadwal → tempel ke 5 slot per kanal.
 */
export async function isiSlotHarian() {
  const kanals = await db.kanal.findMany({
    include: { slot: { where: { aktif: true }, orderBy: { slotKe: "asc" } } },
  });

  const hasil = [];

  for (const kanal of kanals) {
    // Ambil paket yang siap dijadwalkan (status: terjadwal, belum punya terjadwalPada)
    const paketSiap = await db.paketKonten.findMany({
      where: {
        kanalId: kanal.id,
        status: "terjadwal",
        terjadwalPada: null,
      },
      orderBy: { createdAt: "asc" },
    });

    // Isi slot yang tersedia
    const slotTerisi = await db.paketKonten.count({
      where: {
        kanalId: kanal.id,
        terjadwalPada: {
          gte: new Date(new Date().setUTCHours(0, 0, 0, 0)),
        },
      },
    });

    const slotTersedia = kanal.slot.length - slotTerisi;
    const akanDiisi = Math.min(slotTersedia, paketSiap.length);

    for (let i = 0; i < akanDiisi; i++) {
      const paket = paketSiap[i];
      const slot = kanal.slot[slotTerisi + i];
      if (!slot) break;

      const waktuTayang = menitUtcToDate(slot.menitUtc);

      await db.paketKonten.update({
        where: { id: paket.id },
        data: {
          slotKe: slot.slotKe,
          terjadwalPada: waktuTayang,
        },
      });
    }

    // Peringatan bila antrean kurang
    if (paketSiap.length < kanal.slot.length) {
      const kurang = kanal.slot.length - paketSiap.length;
      await db.peringatan.create({
        data: {
          kanalId: kanal.id,
          tipe: "antrean_kritis",
          pesan: `Antrean ${kanal.nama} kurang ${kurang} paket untuk besok. Generate ide tambahan!`,
        },
      });
    }

    hasil.push({
      kanal: kanal.slug,
      diisi: akanDiisi,
      tersedia: slotTersedia,
      totalPaket: paketSiap.length,
    });
  }

  // Reschedule job isi_slot untuk besok (jam 04:00 UTC)
  const besok = new Date();
  besok.setUTCDate(besok.getUTCDate() + 1);
  besok.setUTCHours(4, 0, 0, 0);
  await antre("isi_slot", {}, undefined, besok);

  return hasil;
}

/**
 * Catch-up: jadwalkan paket yang slot-nya sudah lewat (server baru nyala).
 */
export async function catchUpSlot() {
  const now = new Date();
  const paketLewat = await db.paketKonten.findMany({
    where: {
      status: "terjadwal",
      terjadwalPada: { lt: now },
      tayangPada: null,
    },
    include: { kanal: true },
  });

  let dijadwalkan = 0;
  for (const paket of paketLewat) {
    // Jadwalkan segera (1 menit dari sekarang)
    const segera = new Date(Date.now() + 60000);
    await db.paketKonten.update({
      where: { id: paket.id },
      data: { terjadwalPada: segera },
    });
    dijadwalkan++;
  }

  return { dijadwalkan };
}
