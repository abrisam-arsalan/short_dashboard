/**
 * KartuKanal — kartu ringkasan per kanal di dashboard (FR-1).
 */
import Link from "next/link";

interface Props {
  slug: string;
  nama: string;
  handle: string;
  niche: string;
  killSwitch: string;
  antreanHariIni: number;
  targetHarian: number;
}

const WARNA_KANAL: Record<string, string> = {
  sawdustsprint: "border-amber-600 bg-amber-950/30",
  bloomblitz: "border-green-600 bg-green-950/30",
  wildlapse: "border-orange-600 bg-orange-950/30",
};

const EMOJI_KANAL: Record<string, string> = {
  sawdustsprint: "🪵",
  bloomblitz: "🌱",
  wildlapse: "🏕️",
};

const LABEL_KS: Record<string, { text: string; warna: string }> = {
  auto: { text: "Auto Penuh", warna: "text-green-400" },
  review: { text: "Review", warna: "text-yellow-400" },
  jeda: { text: "Jeda", warna: "text-red-400" },
  ikut_global: { text: "Ikut Global", warna: "text-gray-400" },
};

export function KartuKanal({
  slug,
  nama,
  handle,
  niche,
  killSwitch,
  antreanHariIni,
  targetHarian,
}: Props) {
  const border = WARNA_KANAL[slug] ?? "border-gray-700";
  const emoji = EMOJI_KANAL[slug] ?? "📺";
  const ks = LABEL_KS[killSwitch] ?? LABEL_KS.ikut_global;

  return (
    <Link
      href={`/kanal/${slug}`}
      className={`block rounded-xl border-2 ${border} p-6 hover:scale-[1.02] transition-transform`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">{emoji}</span>
        <div>
          <h3 className="text-lg font-bold text-white">{nama}</h3>
          <p className="text-sm text-gray-400">{handle} · {niche}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-gray-500">Antrean</div>
          <div className="text-white font-medium">
            {antreanHariIni}/{targetHarian} video
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-500">Mode</div>
          <div className={`font-medium ${ks.warna}`}>{ks.text}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-3 bg-gray-800 rounded-full h-2">
        <div
          className="bg-blue-600 rounded-full h-2 transition-all"
          style={{ width: `${Math.min(100, (antreanHariIni / targetHarian) * 100)}%` }}
        />
      </div>
    </Link>
  );
}
