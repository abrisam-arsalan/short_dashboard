/**
 * StoryboardBoard — garis waktu vertikal 5 (10s) atau 8 (20s) cut.
 * Tiap cut: badge FUNGSI, visual, gerakan kamera, teks overlay, narasi ID, nada tag, detik awal-akhir.
 * Tombol "Generate Prompt per Cut" memanggil /api/storyboard/[sbId]/cut/[cutId]/prompt per cut.
 */
"use client";

import { useState } from "react";
import { UI } from "@/lib/teks";

type Cut = {
  id: string;
  storyboardId: string;
  urutan: number;
  labelCut: string | null;
  detikAwal: number;
  detikAkhir: number;
  visual: string;
  gerakanKamera: string;
  teksOverlay: string | null;
  narasiId: string;
  nadaTag: string | null;
  fungsiCatatan: string | null;
};

type Storyboard = {
  id: string;
  ideId: string;
  durasiTotal: number;
  presetCut: string;
  status: string;
  detailValidasi: string;
  cuts: Cut[];
};

interface Props {
  storyboard: Storyboard;
}

const WARNA_FUNGSI: Record<string, string> = {
  HOOK: "bg-red-600",
  "HOOK-2": "bg-red-500",
  HIGHLIGHT: "bg-amber-500",
  DETAIL: "bg-amber-500",
  BENEFIT: "bg-emerald-600",
  "BENEFIT-2": "bg-emerald-500",
  DESIRE: "bg-violet-600",
  MOOD: "bg-violet-500",
  CTA: "bg-blue-600",
};

function warnaBadge(label: string | null) {
  if (!label) return "bg-gray-700";
  return WARNA_FUNGSI[label] ?? "bg-gray-700";
}

export function StoryboardBoard({ storyboard }: Props) {
  const [promptPerCut, setPromptPerCut] = useState<Record<string, { teksPrompt: string; statusValidasi: string } | null>>({});
  const [loadingCut, setLoadingCut] = useState<string | null>(null);
  const [tersalinId, setTersalinId] = useState<string | null>(null);
  const [slotPerCut, setSlotPerCut] = useState<Record<string, string>>({});

  async function generatePromptCut(cut: Cut) {
    setLoadingCut(cut.id);
    const slot = (slotPerCut[cut.id] as "utama" | "alt1" | "alt2") ?? "utama";
    try {
      const res = await fetch(`/api/storyboard/${storyboard.id}/cut/${cut.id}/prompt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Gagal generate prompt cut");
      const cp = json.cutPrompt as { teksPrompt: string; statusValidasi: string };
      setPromptPerCut((prev) => ({ ...prev, [cut.id]: { teksPrompt: cp.teksPrompt, statusValidasi: cp.statusValidasi } }));
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Gagal generate prompt cut");
    } finally {
      setLoadingCut(null);
    }
  }

  async function salin(cutId: string, teks: string) {
    try {
      await navigator.clipboard.writeText(teks);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = teks;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setTersalinId(cutId);
    setTimeout(() => setTersalinId(null), 1800);
  }

  const statusWarna =
    storyboard.status === "valid"
      ? "bg-green-900/30 text-green-400 border-green-800"
      : storyboard.status === "ditolak"
        ? "bg-red-900/30 text-red-400 border-red-800"
        : "bg-yellow-900/30 text-yellow-400 border-yellow-800";

  const durasiLabel = storyboard.durasiTotal === 10 ? UI.storyboard.judulShort : UI.storyboard.judulDetail;

  return (
    <div className="space-y-5">
      {/* Header storyboard */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-white font-bold">{durasiLabel}</div>
          <div className="text-sm text-gray-400">
            {storyboard.presetCut} · {storyboard.durasiTotal}s · {storyboard.cuts.length} cut · kontigu tanpa celah
          </div>
          <div className="text-xs text-gray-500 mt-1">{UI.storyboard.generatedInfo}</div>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${statusWarna}`}>
          {storyboard.status === "valid"
            ? UI.storyboard.status.valid
            : storyboard.status === "ditolak"
              ? UI.storyboard.status.ditolak
              : UI.storyboard.status.draft}
        </span>
      </div>

      {/* Timeline vertikal */}
      <div className="relative">
        {/* garis */}
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-gray-800 hidden sm:block" aria-hidden />
        <div className="space-y-4">
          {storyboard.cuts.map((cut) => {
            const cp = promptPerCut[cut.id];
            return (
              <div key={cut.id} className="relative flex gap-4">
                {/* node */}
                <div className="hidden sm:flex flex-col items-center shrink-0 w-10">
                  <div className="w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-sm font-bold text-white">
                    {cut.urutan}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1 font-mono">
                    {cut.detikAwal}–{cut.detikAkhir}s
                  </div>
                </div>

                {/* kartu cut */}
                <div className="flex-1 bg-gray-900 rounded-xl border border-gray-800 p-4 sm:p-5 space-y-3">
                  {/* baris atas: FUNGSI + detik (mobile) + nada */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold text-white ${warnaBadge(cut.labelCut)}`}>
                      {UI.storyboard.cut} {cut.urutan} · {cut.labelCut}
                    </span>
                    <span className="sm:hidden text-xs text-gray-500 font-mono">
                      {cut.detikAwal}–{cut.detikAkhir}s
                    </span>
                    {cut.nadaTag && (
                      <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-300">
                        🎙️ {cut.nadaTag}
                      </span>
                    )}
                    <span className="px-2 py-1 rounded-full bg-gray-800 border border-gray-700 text-xs text-gray-400 font-mono">
                      {cut.gerakanKamera}
                    </span>
                    {cut.fungsiCatatan && (
                      <span className="text-xs text-gray-500 italic hidden lg:inline">{cut.fungsiCatatan}</span>
                    )}
                  </div>

                  {/* Visual */}
                  <div>
                    <div className="text-[11px] tracking-widest text-gray-500 font-medium">{UI.storyboard.visual}</div>
                    <p className="text-sm text-gray-200 mt-1 leading-relaxed">{cut.visual}</p>
                    {cut.fungsiCatatan && <p className="text-xs text-gray-500 mt-1 lg:hidden italic">{cut.fungsiCatatan}</p>}
                  </div>

                  {/* Narasi + teks overlay */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-[11px] tracking-widest text-gray-500">{UI.storyboard.narasiId}</div>
                      <p className="text-sm text-white mt-1">&ldquo;{cut.narasiId}&rdquo;</p>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
                      <div className="text-[11px] tracking-widest text-gray-500">{UI.storyboard.teksLayar}</div>
                      <p className="text-sm text-gray-200 mt-1">{cut.teksOverlay ?? <span className="text-gray-500">—</span>}</p>
                    </div>
                  </div>

                  {/* Action per cut: generate prompt */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <div className="flex gap-1">
                      {(["utama", "alt1", "alt2"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setSlotPerCut((p) => ({ ...p, [cut.id]: s }))}
                          className={`px-2.5 py-1 rounded text-xs font-medium border ${((slotPerCut[cut.id] ?? "utama") === s) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-800 text-gray-400 border-gray-700 hover:bg-gray-700"}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => generatePromptCut(cut)}
                      disabled={loadingCut === cut.id}
                      className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg text-xs font-medium border border-gray-700"
                    >
                      {loadingCut === cut.id ? "Memuat..." : `✨ ${UI.storyboard.generateSingleCutPrompt}`}
                    </button>
                    {cp && (
                      <button
                        onClick={() => salin(cut.id, cp.teksPrompt)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
                      >
                        {tersalinId === cut.id ? `✅ ${UI.modeFlow.tersalin}` : `📋 ${UI.storyboard.salinPromptCut}`}
                      </button>
                    )}
                    {cp && (
                      <span className={`text-xs px-2 py-1 rounded-full ${cp.statusValidasi === "valid" ? "bg-green-900/30 text-green-400" : cp.statusValidasi === "peringatan" ? "bg-yellow-900/30 text-yellow-400" : "bg-red-900/30 text-red-400"}`}>
                        {cp.statusValidasi}
                      </span>
                    )}
                  </div>

                  {cp && (
                    <div className="bg-gray-950 rounded-lg border border-gray-800 p-3">
                      <div className="text-[11px] tracking-widest text-gray-500 mb-1">PROMPT CUT {cut.urutan} · siap tempel Flow</div>
                      <p className="text-xs text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">{cp.teksPrompt}</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
