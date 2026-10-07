/**
 * PratinjauOverlay — mockup posisi text overlay (9:16) untuk preview sebelum generate.
 */
"use client";

interface Props {
  hookText: string;
  warnaTeks: string;
  warnaBox: string;
  fontFile: string;
  radiusBox: number;
}

const FONT_MAP: Record<string, string> = {
  "fonts/BarlowCondensed-Bold.ttf": "'Barlow Condensed', sans-serif",
  "fonts/Quicksand-Bold.ttf": "'Quicksand', sans-serif",
  "fonts/BlackOpsOne-Regular.ttf": "'Black Ops One', sans-serif",
};

export function PratinjauOverlay({ hookText, warnaTeks, warnaBox, fontFile, radiusBox }: Props) {
  const fontFamily = FONT_MAP[fontFile] || "sans-serif";

  return (
    <div className="w-[270px] h-[480px] bg-gray-950 rounded-xl overflow-hidden relative border border-gray-700">
      {/* Mockup video background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-950" />

      {/* Text overlay di posisi safe-area (y ≈ 22% dari atas) */}
      <div
        className="absolute left-1/2 -translate-x-1/2 px-4 py-2 text-center"
        style={{
          top: "22%",
          maxWidth: "85%",
          backgroundColor: warnaBox,
          borderRadius: `${radiusBox}px`,
          border: "3px solid #000000AA",
        }}
      >
        <span
          className="font-bold text-lg leading-tight"
          style={{ color: warnaTeks, fontFamily }}
        >
          {hookText}
        </span>
      </div>

      {/* Label safe-area */}
      <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-gray-600">
        1080 × 1920 · Safe-area
      </div>
    </div>
  );
}
