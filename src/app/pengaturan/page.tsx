import { db } from "@/lib/db";
import { connection } from "next/server";
import { PanelTiktokDraft } from "@/components/PanelTiktokDraft";


export const instant = false;
export default async function PengaturanPage() {
  await connection();
  const setelan = await db.setelan.findMany();
  const kanals = await db.kanal.findMany({ include: { kredensial: true } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">⚙️ Pengaturan</h1>
        <p className="text-gray-400">Kredensial, retensi, dan konfigurasi global</p>
      </div>

      {/* OAuth YouTube per Kanal */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">🔗 Koneksi YouTube per Kanal</h2>
        <div className="space-y-3">
          {kanals.map((kanal) => {
            const punyaClient = kanal.kredensial.some(
              (k) => k.provider === "youtube_oauth" && k.label === "client_id"
            );
            const punyaToken = kanal.kredensial.some(
              (k) => k.provider === "youtube_oauth" && k.label === "refresh_token"
            );
            return (
              <div key={kanal.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
                <div>
                  <span className="text-gray-200 font-medium">{kanal.nama}</span>
                  <span className="ml-3 text-sm text-gray-500">
                    {punyaToken ? "🟢 Terhubung" : punyaClient ? "🟡 Siap OAuth" : "🔴 Belum setup"}
                  </span>
                </div>
                {!punyaToken && (
                  <a
                    href={`/api/auth/youtube/${kanal.slug}`}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Hubungkan YouTube
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Set client_id & client_secret per kanal di tabel Kredensial (provider: youtube_oauth).
          OAuth perlu redirect URI: <code>/api/auth/youtube/callback</code>
        </p>
      </div>

      {/* TikTok Draft Panel (FR-20a) */}
      <PanelTiktokDraft />

      {/* Setelan Global */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">Setelan Global</h2>
        <div className="space-y-3">
          {setelan.map((s) => (
            <div key={s.key} className="flex items-center justify-between bg-gray-800 rounded px-4 py-3">
              <span className="text-gray-300 text-sm">{s.key}</span>
              <span className="text-gray-400 text-sm font-mono">{s.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Kredensial per Kanal */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">🔐 Kredensial per Kanal</h2>
        <div className="space-y-4">
          {kanals.map((kanal) => (
            <div key={kanal.id} className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-medium text-white mb-2">{kanal.nama}</h3>
              {kanal.kredensial.length === 0 ? (
                <div className="text-gray-500 text-sm">Belum ada kredensial tersimpan</div>
              ) : (
                <div className="space-y-1">
                  {kanal.kredensial.map((k) => (
                    <div key={k.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{k.provider}: {k.label}</span>
                      <span className="text-green-400">🔒 Terenkripsi</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-bold text-white mb-4">ℹ️ Info Sistem</h2>
        <div className="text-sm text-gray-400 space-y-2">
          <div>Database: SQLite (dev) / PostgreSQL (prod)</div>
          <div>Storage: {process.env.STORAGE_ROOT || "./storage"}</div>
          <div>Gemini Mock: {process.env.GEMINI_MOCK === "1" ? "Aktif" : "Nonaktif"}</div>
          <div>Zona Waktu: {process.env.TZ_OPERATOR || "Asia/Jakarta"}</div>
        </div>
      </div>
    </div>
  );
}
