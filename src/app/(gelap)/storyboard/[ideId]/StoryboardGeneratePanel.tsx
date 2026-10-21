"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UI } from "@/lib/teks";

interface Props {
  ideId: string;
  storyboard: { durasiTotal: number; presetCut: string } | null;
}

export function StoryboardGeneratePanel({ ideId, storyboard }: Props) {
  const router = useRouter();
  const [durasi, setDurasi] = useState<10 | 20>(storyboard?.durasiTotal === 20 ? 20 : 10);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const preset = durasi === 10 ? "short" : "detail";

  async function handleGenerate() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ideId, durasiTotal: durasi, preset }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal generate storyboard");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal generate storyboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="text-sm text-gray-300 shrink-0">{UI.storyboard.pilihDurasi}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setDurasi(10)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${durasi === 10 ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`}
          >
            {UI.storyboard.presetShort}
          </button>
          <button
            onClick={() => setDurasi(20)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border ${durasi === 20 ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`}
          >
            {UI.storyboard.presetDetail}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
        >
          {loading ? "Membuat..." : storyboard ? UI.storyboard.buatUlang : UI.storyboard.buat}
        </button>
        {storyboard && (
          <span className="text-xs text-gray-500">
            {UI.storyboard.menampilkan} {storyboard.presetCut} · {storyboard.durasiTotal}s
          </span>
        )}
      </div>

      {err && <div className="text-sm text-red-400 bg-red-900/30 rounded-lg p-3 border border-red-800">{err}</div>}

      <p className="text-xs text-gray-500">{UI.storyboard.generatedInfo}</p>
    </div>
  );
}
