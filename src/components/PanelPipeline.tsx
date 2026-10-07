/**
 * PanelPipeline — papan status pipeline 8 tahap (FR-2).
 */
import { UI } from "@/lib/teks";

interface Paket {
  id: string;
  judul: string;
  kanal: string;
  status: string;
}

interface Props {
  paket: Paket[];
}

const URUTAN_STATUS = [
  "antrean_ide",
  "prompt_siap",
  "generating",
  "kotak_masuk_aset",
  "komposisi_overlay",
  "menunggu_review",
  "terjadwal",
  "tayang",
] as const;

const WARNA_STATUS: Record<string, string> = {
  antrean_ide: "bg-gray-700",
  prompt_siap: "bg-blue-700",
  generating: "bg-purple-700",
  kotak_masuk_aset: "bg-cyan-700",
  komposisi_overlay: "bg-indigo-700",
  menunggu_review: "bg-yellow-700",
  terjadwal: "bg-emerald-700",
  tayang: "bg-green-700",
  gagal: "bg-red-700",
};

export function PanelPipeline({ paket }: Props) {
  return (
    <div className="space-y-4">
      {URUTAN_STATUS.map((status) => {
        const items = paket.filter((p) => p.status === status);
        return (
          <div key={status} className="bg-gray-900 rounded-lg border border-gray-800">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${WARNA_STATUS[status]}`} />
                <span className="font-medium text-white">
                  {(UI.status as Record<string, string>)[status] ?? status}
                </span>
              </div>
              <span className="text-sm text-gray-500">{items.length} paket</span>
            </div>
            <div className="p-3 space-y-2">
              {items.length === 0 ? (
                <div className="text-sm text-gray-600 italic">Kosong</div>
              ) : (
                items.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-gray-800 rounded px-3 py-2"
                  >
                    <span className="text-sm text-gray-200 truncate">{p.judul}</span>
                    <span className="text-xs text-gray-500">{p.kanal}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
