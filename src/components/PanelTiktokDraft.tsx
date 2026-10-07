/**
 * PanelTiktokDraft — FR-20a: Panel pengelolaan draft TikTok Inbox.
 * Daftar draft menunggu publish + tombol tandai sudah tayang + notifikasi pengingat.
 */
"use client";

import { useState, useEffect } from "react";

interface DraftTiktok {
  id: string;
  judul: string;
  kanal: string;
  kanalSlug: string;
  status: string;
  tiktokPublishId?: string;
  terjadwalPada?: string;
  filePath?: string;
}

export function PanelTiktokDraft() {
  const [drafts, setDrafts] = useState<DraftTiktok[]>([]);
  const [loading, setLoading] = useState(true);

  async function muatDraft() {
    setLoading(true);
    try {
      const res = await fetch("/api/publish/tiktok");
      const data = await res.json();
      setDrafts(data.daftar || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    muatDraft();
  }, []);

  async function tandaiTayang(paketId: string) {
    await fetch(`/api/publish/tiktok/${paketId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ aksi: "tandai_tayang" }),
    });
    muatDraft();
  }

  if (loading) {
    return <div className="text-gray-500 text-sm">Memuat draft TikTok...</div>;
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <h2 className="text-lg font-bold text-white mb-4">
        📱 Draft TikTok Menunggu Publish ({drafts.length})
      </h2>

      {drafts.length === 0 ? (
        <div className="text-gray-500">Tidak ada draft yang menunggu publish</div>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-gray-200 text-sm">{d.judul}</div>
                <div className="text-xs text-gray-500">
                  {d.kanal} · {d.status}
                  {d.terjadwalPada && (
                    <span>
                      {" "}
                      · dijadwalkan{" "}
                      {new Date(d.terjadwalPada).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => tandaiTayang(d.id)}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                ✅ Sudah Tayang
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
