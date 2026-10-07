import { db } from "@/lib/db";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { KartuPromptPack } from "@/components/KartuPromptPack";
import { PratinjauOverlay } from "@/components/PratinjauOverlay";


export const instant = false;
export default async function PaketPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const paket = await db.paketKonten.findUnique({
    where: { id },
    include: {
      ide: true,
      promptPaket: true,
      caption: true,
      kanal: { include: { profil: true } },
      aset: true,
    },
  });

  if (!paket) notFound();

  const profil = paket.kanal.profil;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{paket.ide?.judulEn}</h1>
        <p className="text-gray-400">
          {paket.kanal.nama} · Status: {paket.status}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Kolom kiri: detail ide */}
        <div className="space-y-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold text-white mb-3">💡 Detail Ide</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">Hook Visual:</span>
                <div className="text-gray-200">{paket.ide?.hookVisual}</div>
              </div>
              <div>
                <span className="text-gray-500">Transformasi:</span>
                <div className="text-gray-200">{paket.ide?.transformasi}</div>
              </div>
              <div>
                <span className="text-gray-500">Skor:</span>
                <div className="text-yellow-400">{"⭐".repeat(paket.ide?.skor ?? 0)}</div>
              </div>
            </div>
          </div>

          {/* Preview overlay */}
          {profil && (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
              <h3 className="font-bold text-white mb-3">🎨 Preview Overlay</h3>
              <PratinjauOverlay
                hookText={paket.ide?.judulEn ?? ""}
                warnaTeks={profil.warnaTeks}
                warnaBox={profil.warnaBox}
                fontFile={profil.fontFile}
                radiusBox={profil.radiusBox}
              />
            </div>
          )}
        </div>

        {/* Kolom tengah: prompt pack */}
        <div>
          {paket.promptPaket ? (
            <KartuPromptPack
              promptUtama={paket.promptPaket.promptUtama}
              promptAlt1={paket.promptPaket.promptAlt1}
              promptAlt2={paket.promptPaket.promptAlt2}
              statusValidasi={paket.promptPaket.statusValidasi}
              detailValidasi={paket.promptPaket.detailValidasi}
            />
          ) : (
            <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 text-center text-gray-500">
              Prompt belum digenerate
            </div>
          )}
        </div>

        {/* Kolom kanan: caption + aset */}
        <div className="space-y-4">
          {/* Caption */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold text-white mb-3">📝 Caption</h3>
            {paket.caption ? (
              <div className="space-y-3 text-sm">
                <div>
                  <div className="text-gray-500">YouTube Shorts:</div>
                  <div className="text-gray-200">{paket.caption.ytJudul}</div>
                  <div className="text-gray-400 text-xs mt-1">{paket.caption.ytDeskripsi}</div>
                  <div className="text-blue-400 text-xs mt-1">
                    {JSON.parse(paket.caption.ytHashtag).join(" ")}
                  </div>
                </div>
                <div>
                  <div className="text-gray-500">TikTok:</div>
                  <div className="text-gray-200">{paket.caption.ttTeks}</div>
                  <div className="text-blue-400 text-xs mt-1">
                    {JSON.parse(paket.caption.ttHashtag).join(" ")}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Caption belum digenerate</div>
            )}
          </div>

          {/* Aset */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="font-bold text-white mb-3">🎬 Aset Video</h3>
            {paket.aset.length > 0 ? (
              <div className="space-y-2">
                {paket.aset.map((aset) => (
                  <div key={aset.id} className="bg-gray-800 rounded px-3 py-2 text-xs">
                    <div className="text-gray-300">{aset.jenis} — {aset.sumber}</div>
                    <div className="text-gray-500">{aset.durasiDetik?.toFixed(1)}s</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                Belum ada video. Drop file ke Kotak Masuk Aset.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
