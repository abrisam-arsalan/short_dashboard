/**
 * SaklarMati — kill switch 3-posisi (FR-22).
 * Segmented control: Auto Penuh 🟢 / Review 🟡 / Jeda 🔴
 */
"use client";

import { useState } from "react";
import { UI } from "@/lib/teks";

interface Props {
  kanalSlug: string;
  modeSaatIni: "auto" | "review" | "jeda" | "ikut_global";
  onPerubahan?: () => void;
}

const OPSI = [
  { nilai: "auto" as const, label: UI.killSwitch.auto, emoji: "🟢", warna: "bg-green-600" },
  { nilai: "review" as const, label: UI.killSwitch.review, emoji: "🟡", warna: "bg-yellow-600" },
  { nilai: "jeda" as const, label: UI.killSwitch.jeda, emoji: "🔴", warna: "bg-red-600" },
];

export function SaklarMati({ kanalSlug, modeSaatIni, onPerubahan }: Props) {
  const [mode, setMode] = useState(modeSaatIni);
  const [loading, setLoading] = useState(false);

  async function ubahMode(modeBaru: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/kanal/${kanalSlug}/killswitch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: modeBaru }),
      });
      if (res.ok) {
        setMode(modeBaru as typeof mode);
        onPerubahan?.();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-400">{UI.killSwitch.label}:</span>
      <div className="flex rounded-lg overflow-hidden border border-gray-700">
        {OPSI.map((opsi) => (
          <button
            key={opsi.nilai}
            onClick={() => ubahMode(opsi.nilai)}
            disabled={loading}
            className={`
              px-3 py-1.5 text-sm font-medium transition-colors
              ${mode === opsi.nilai
                ? `${opsi.warna} text-white`
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }
              ${loading ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {opsi.emoji} {opsi.label}
          </button>
        ))}
      </div>
    </div>
  );
}
