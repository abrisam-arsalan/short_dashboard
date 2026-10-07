/**
 * Publish Handler — upload YouTube Shorts + TikTok (FR-19, FR-20, FR-21).
 * Retry 3× dengan exponential backoff, sequential queue.
 */
import { uploadYoutube } from "@/server/lapisan/youtube";
import { uploadTiktokInbox } from "@/server/lapisan/tiktok";
import { db } from "@/lib/db";
import { antre } from "@/lib/antre";

/**
 * Publish ke YouTube Shorts. Retry 3× otomatis (FR-21).
 */
export async function handlePublishYt(paketId: string) {
  console.log(`📤 [YT] Upload ${paketId}...`);
  const hasil = await uploadYoutube(paketId);

  if (!hasil.sukses) {
    const paket = await db.paketKonten.findUnique({ where: { id: paketId } });
    const percobaan = (paket?.percobaan ?? 0) + 1;

    await db.paketKonten.update({
      where: { id: paketId },
      data: { percobaan, errorTerakhir: hasil.pesan },
    });

    if (percobaan >= 3) {
      // Gagal 3× → status gagal + peringatan
      await db.paketKonten.update({
        where: { id: paketId },
        data: { status: "gagal" },
      });
      await db.peringatan.create({
        data: {
          tipe: "gagal_upload",
          pesan: `Upload YouTube gagal 3× untuk paket ${paketId}: ${hasil.pesan}`,
        },
      });
      console.error(`   ❌ Gagal 3×: ${hasil.pesan}`);
    } else {
      // Retry dengan backoff: 2 menit, 4 menit
      const delayMs = Math.pow(2, percobaan) * 60000;
      const runAt = new Date(Date.now() + delayMs);
      await antre("publish_yt", { paketId }, paketId, runAt);
      console.log(`   🔄 Retry ${percobaan}/3 dalam ${delayMs / 60000} menit`);
    }
    return;
  }

  console.log(`   ✅ ${hasil.pesan}`);
  // Antre publish TikTok setelah YouTube sukses
  await antre("publish_tt", { paketId }, paketId);
}

/**
 * Publish ke TikTok Inbox. Retry 3× otomatis (FR-21).
 */
export async function handlePublishTt(paketId: string) {
  console.log(`📤 [TT] Upload ${paketId}...`);
  const hasil = await uploadTiktokInbox(paketId);

  if (!hasil.sukses) {
    const paket = await db.paketKonten.findUnique({ where: { id: paketId } });
    const percobaan = (paket?.percobaan ?? 0) + 1;

    await db.paketKonten.update({
      where: { id: paketId },
      data: { percobaan, errorTerakhir: hasil.pesan },
    });

    if (percobaan >= 3) {
      await db.peringatan.create({
        data: {
          tipe: "gagal_upload",
          pesan: `Upload TikTok gagal 3× untuk paket ${paketId}: ${hasil.pesan}`,
        },
      });
      console.error(`   ❌ Gagal 3×: ${hasil.pesan}`);
    } else {
      const delayMs = Math.pow(2, percobaan) * 60000;
      await antre("publish_tt", { paketId }, paketId, new Date(Date.now() + delayMs));
      console.log(`   🔄 Retry ${percobaan}/3 dalam ${delayMs / 60000} menit`);
    }
    return;
  }

  if (hasil.perluManual) {
    console.log(`   ⚠️ ${hasil.pesan} (perlu tap publish manual)`);
  } else {
    console.log(`   ✅ ${hasil.pesan}`);
  }
}
