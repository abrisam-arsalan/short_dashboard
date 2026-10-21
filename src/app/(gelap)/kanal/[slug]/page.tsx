import { db } from "@/lib/db";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { SaklarMati } from "@/components/SaklarMati";
import { PapanSlot } from "@/components/PapanSlot";
import { PratinjauOverlay } from "@/components/PratinjauOverlay";
import { menitUtcKeJamLokal } from "@/lib/waktu";


export const instant = false;
export default async function KanalPage({ params }: { params: Promise<{ slug: string }> }) {
  await connection();
  const { slug } = await params;
  const kanal = await db.kanal.findUnique({
    where: { slug },
    include: {
      profil: true,
      slot: { orderBy: { slotKe: "asc" } },
      paket: {
        include: { ide: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!kanal) notFound();

  const profil = kanal.profil;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">{kanal.nama}</h1>
          <p className="text-gray-400">{kanal.handle} · {kanal.niche}</p>
        </div>
        <SaklarMati kanalSlug={kanal.slug} modeSaatIni={kanal.killSwitch as "auto"} />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Profil Niche */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">🎯 Profil Niche</h2>
          {profil ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Topik:</span>
                <div className="text-gray-200">{JSON.parse(profil.topik).join(", ")}</div>
              </div>
              <div>
                <span className="text-gray-500">Tone:</span>
                <div className="text-gray-200">{profil.tone}</div>
              </div>
              <div>
                <span className="text-gray-500">Gaya:</span>
                <div className="text-gray-200">{profil.spesimenGaya}</div>
              </div>
              <div>
                <span className="text-gray-500">Contoh Hook:</span>
                <div className="text-gray-200 italic">“{profil.contohHook}”</div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500">Belum ada profil niche</div>
          )}
        </div>

        {/* Preview Overlay */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="text-lg font-bold text-white mb-4">🎨 Gaya Overlay</h2>
          {profil && (
            <PratinjauOverlay
              hookText={profil.contohHook}
              warnaTeks={profil.warnaTeks}
              warnaBox={profil.warnaBox}
              fontFile={profil.fontFile}
              radiusBox={profil.radiusBox}
            />
          )}
        </div>
      </div>

      {/* Slot Jadwal */}
      <PapanSlot
        namaKanal={kanal.nama}
        slots={kanal.slot.map((s) => {
          const paket = kanal.paket.find((p) => p.slotKe === s.slotKe && p.terjadwalPada);
          return {
            slotKe: s.slotKe,
            menitUtc: s.menitUtc,
            aktif: s.aktif,
            paketJudul: paket?.ide?.judulEn,
          };
        })}
      />

      {/* Paket Konten Terbaru */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">📦 Paket Konten Terbaru</h2>
        <div className="space-y-2">
          {kanal.paket.length === 0 ? (
            <div className="text-gray-500">Belum ada paket konten</div>
          ) : (
            kanal.paket.map((paket) => (
              <div key={paket.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <div className="text-gray-200 text-sm">{paket.ide?.judulEn}</div>
                  <div className="text-xs text-gray-500">{paket.status}</div>
                </div>
                <a
                  href={`/paket/${paket.id}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Detail →
                </a>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
