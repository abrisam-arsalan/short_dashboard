/**
 * PeringatanPanel — tampilkan alerts (FR-3).
 */
interface Peringatan {
  id: string;
  tipe: string;
  pesan: string;
  dibaca: boolean;
  createdAt: string;
}

interface Props {
  peringatan: Peringatan[];
}

const EMOJI_TIPE: Record<string, string> = {
  antrean_kritis: "⚠️",
  gagal_generate: "❌",
  gagal_upload: "❌",
  disk_penuh: "💾",
};

export function PeringatanPanel({ peringatan }: Props) {
  const belumDibaca = peringatan.filter((p) => !p.dibaca);

  if (belumDibaca.length === 0) return null;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-4">
      <h3 className="font-bold text-white mb-3">🔔 Peringatan ({belumDibaca.length})</h3>
      <div className="space-y-2">
        {belumDibaca.map((p) => (
          <div
            key={p.id}
            className="flex items-start gap-3 bg-gray-800 rounded-lg p-3"
          >
            <span>{EMOJI_TIPE[p.tipe] ?? "⚠️"}</span>
            <div>
              <p className="text-sm text-gray-200">{p.pesan}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(p.createdAt).toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
