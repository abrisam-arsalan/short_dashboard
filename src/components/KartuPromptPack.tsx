/**
 * KartuPromptPack — Mode Flow UI (FR-13).
 * Rekap setelan target + kotak prompt + Salin Prompt + panduan Google Flow.
 */
"use client";

import { useState } from "react";
import { UI } from "@/lib/teks";

interface Props {
  promptUtama: string;
  promptAlt1: string;
  promptAlt2: string;
  statusValidasi: string;
  detailValidasi: string; // JSON array temuan
}

export function KartuPromptPack({
  promptUtama,
  promptAlt1,
  promptAlt2,
  statusValidasi,
  detailValidasi,
}: Props) {
  const [varianAktif, setVarianAktif] = useState<"utama" | "alt1" | "alt2">("utama");
  const [tersalin, setTersalin] = useState(false);

  const prompt =
    varianAktif === "utama" ? promptUtama : varianAktif === "alt1" ? promptAlt1 : promptAlt2;

  const temuan = JSON.parse(detailValidasi || "[]") as Array<{
    kode: string;
    pesan: string;
    saran?: string;
    level: string;
  }>;

  async function salinPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      // Fallback untuk HTTP/localhost
      const ta = document.createElement("textarea");
      ta.value = prompt;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setTersalin(true);
    setTimeout(() => setTersalin(false), 2000);
  }

  const warnaValidasi =
    statusValidasi === "valid"
      ? "text-green-400 bg-green-900/30"
      : statusValidasi === "peringatan"
        ? "text-yellow-400 bg-yellow-900/30"
        : "text-red-400 bg-red-900/30";

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">{UI.modeFlow.judul}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${warnaValidasi}`}>
          {statusValidasi === "valid"
            ? UI.modeFlow.validasiValid
            : statusValidasi === "peringatan"
              ? UI.modeFlow.validasiPeringatan
              : UI.modeFlow.validasiDitolak}
        </span>
      </div>

      {/* Rekap Setelan */}
      <div className="bg-gray-800 rounded-lg p-4 grid grid-cols-4 gap-4 text-sm">
        <div>
          <div className="text-gray-500">{UI.modeFlow.engine}</div>
          <div className="text-white font-medium">Gemini Omni Flash 1.1</div>
        </div>
        <div>
          <div className="text-gray-500">{UI.modeFlow.rasio}</div>
          <div className="text-white font-medium">9:16 (Vertikal)</div>
        </div>
        <div>
          <div className="text-gray-500">{UI.modeFlow.durasi}</div>
          <div className="text-white font-medium">6–10 detik</div>
        </div>
        <div>
          <div className="text-gray-500">{UI.modeFlow.shot}</div>
          <div className="text-white font-medium">1 continuous shot</div>
        </div>
      </div>

      {/* Tabs Varian */}
      <div className="flex gap-2">
        {(["utama", "alt1", "alt2"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setVarianAktif(v)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${varianAktif === v
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }
            `}
          >
            {v === "utama" ? UI.modeFlow.promptUtama : `${UI.modeFlow.alternatif} ${v === "alt1" ? "1" : "2"}`}
          </button>
        ))}
      </div>

      {/* Prompt Box */}
      <div className="relative">
        <textarea
          readOnly
          value={prompt}
          rows={8}
          className="w-full bg-gray-800 text-gray-200 rounded-lg p-4 font-mono text-sm border border-gray-700 resize-none"
        />
      </div>

      {/* Tombol Salin */}
      <div className="flex gap-3">
        <button
          onClick={salinPrompt}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {tersalin ? `✅ ${UI.modeFlow.tersalin}` : `📋 ${UI.modeFlow.salinPrompt}`}
        </button>
      </div>

      {/* Panduan */}
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 space-y-1">
        <div className="font-medium text-white mb-2">{UI.modeFlow.panduan}</div>
        <div>{UI.modeFlow.langkah1}</div>
        <div>{UI.modeFlow.langkah2}</div>
        <div>{UI.modeFlow.langkah3}</div>
        <div>{UI.modeFlow.langkah4}</div>
        <div>{UI.modeFlow.langkah5}</div>
        <div>{UI.modeFlow.langkah6}</div>
        <div>{UI.modeFlow.langkah7}</div>
      </div>

      {/* Temuan Validator */}
      {temuan.length > 0 && (
        <div className="space-y-2">
          {temuan.map((t, i) => (
            <div
              key={i}
              className={`
                text-sm rounded-lg p-3
                ${t.level === "error" ? "bg-red-900/30 text-red-300" : "bg-yellow-900/30 text-yellow-300"}
              `}
            >
              <span className="font-medium">{t.pesan}</span>
              {t.saran && <div className="text-xs mt-1 opacity-75">{t.saran}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
