/**
 * Gemini API Client — wrapper untuk generateContent dengan structured output.
 * Mendukung mode mock (GEMINI_MOCK=1) untuk testing tanpa API key.
 */
import { GoogleGenAI } from "@google/genai";

export type TipeGenerate = "ide" | "prompt" | "caption";

// === Mock Fixtures ===
const MOCK_IDE = {
  ideas: [
    {
      judulEn: "From Raw Plank to Floating Shelf in 8 Seconds",
      hookVisual: "Raw walnut plank clamped on workbench, sawdust particles in morning light",
      transformasi: "Raw plank → sanded, joined, and mounted floating shelf",
      alasanPotensi: "Shelf projects consistently get high retention; the before/after is dramatic",
      skor: 5,
    },
    {
      judulEn: "Wood Glue-Up Magic: 4 Boards Become 1 Table Top",
      hookVisual: "Four mismatched boards laid side by side, glue bottle in frame",
      transformasi: "4 separate boards → seamless tabletop with visible grain continuity",
      alasanPotensi: "Glue-up videos trigger satisfying ASMR; table tops are universally appealing",
      skor: 5,
    },
    {
      judulEn: "Restoring a 100-Year-Old Chair in 10 Seconds",
      hookVisual: "Broken antique chair with peeling paint and cracked joints",
      transformasi: "Wrecked antique → gleaming restored chair with visible character",
      alasanPotensi: "Restoration content has massive audience; the transformation is extreme",
      skor: 4,
    },
    {
      judulEn: "The Perfect Dovetail Joint — No Nails, Just Wood",
      hookVisual: "Two boards with hand-cut dovetail pins and tails, close-up",
      transformasi: "Cut dovetail pieces → tight, seamless joint sliding together",
      alasanPotensi: "Dovetail content is evergreen; the satisfying click of the joint is peak ASMR",
      skor: 4,
    },
    {
      judulEn: "Turning a Log Into a Bowl in 8 Seconds",
      hookVisual: "Raw log section mounted on lathe, bark still on",
      transformasi: "Raw log section → polished wooden bowl with visible grain rings",
      alasanPotensi: "Lathe work is mesmerizing; bowl reveals always stop scrollers",
      skor: 4,
    },
    {
      judulEn: "Wood Finishing: Dull to Mirror Gloss in 6 Seconds",
      hookVisual: "Unfinished oak surface with visible rough texture and grain",
      transformasi: "Rough unfinished wood → mirror-gloss finish reflecting light",
      alasanPotensi: "Finish reveals are the highest-converting woodworking content",
      skor: 3,
    },
    {
      judulEn: "Building a Birdhouse From One Pallet Slat",
      hookVisual: "Single weathered pallet slat on a workbench",
      transformasi: "One pallet slat → complete birdhouse with perch and pitched roof",
      alasanPotensi: "Upcycling angle is trending; single-material projects get shared heavily",
      skor: 3,
    },
    {
      judulEn: "Sharpening a Dull Chisel to Razor Sharp in 6 Seconds",
      hookVisual: "Dull, nicked chisel blade close-up on whetstone",
      transformasi: "Dull chisel → razor-sharp edge that slices paper effortlessly",
      alasanPotensi: "Tool restoration is a proven niche; sharp tool tests are deeply satisfying",
      skor: 3,
    },
  ],
};

const MOCK_PROMPT = {
  varian: {
    utama: {
      kamera: "A locked-off overhead shot of a workbench, camera completely static.",
      gaya: "Fast-motion time-lapse style, satisfying transformation, hyper-detailed wood grain, warm workshop aesthetic.",
      cahaya: "Warm morning sunlight sweeping across the frame as the hours pass.",
      lokasi: "A professional woodworking workshop with hand tools on the walls.",
      aksi: "A raw walnut plank is measured, cut, sanded, joined, and mounted as a floating shelf with smooth finish.",
      audio: "sped-up whir of tools and sawdust particles, no music",
      hindariTerenkripsi: ["Single locked-off camera, one continuous take.", "Clean frame without overlays."],
    },
    alt1: {
      kamera: "A slow push-in close-up of the workbench surface, camera nearly static.",
      gaya: "Fast-motion time-lapse style, satisfying transformation, hyper-detailed wood grain, warm workshop aesthetic.",
      cahaya: "Soft diffused workshop lighting with warm accent from a desk lamp.",
      lokasi: "A cozy home workshop with wood shavings and hand planes visible.",
      aksi: "A raw walnut plank transforms into a polished floating shelf through visible sanding, joining, and finishing steps.",
      audio: "sped-up scraping of sandpaper and gentle woodworking tools, no music",
      hindariTerenkripsi: ["Single locked-off camera, one continuous take.", "Clean frame without overlays."],
    },
    alt2: {
      kamera: "An extreme close-up of the wood grain filling the frame, locked-off camera.",
      gaya: "Fast-motion time-lapse style, satisfying transformation, hyper-detailed wood grain, warm workshop aesthetic.",
      cahaya: "Golden hour sunlight creating dramatic shadows across the work surface.",
      lokasi: "An open-air workshop with natural light flooding in from large windows.",
      aksi: "Rough walnut wood transforms into a mirror-smooth floating shelf with visible grain pattern.",
      audio: "sped-up whir of electric sander and birdsong from outside, no music",
      hindariTerenkripsi: ["Single locked-off camera, one continuous take.", "Clean frame without overlays."],
    },
  },
};

const MOCK_CAPTION = {
  ytJudul: "Raw Plank to Floating Shelf in 8 Seconds ⚡",
  ytDeskripsi:
    "Watch this walnut plank transform into a floating shelf. New satisfying time-lapse every day! #Shorts",
  ytHashtag: ["#Shorts", "#woodworking", "#timelapse", "#satisfying"],
  ttTeks: "From raw plank to floating shelf in 8 seconds 🪵✨ Satisfying? #woodworking #timelapse #diy",
  ttHashtag: ["#woodworking", "#timelapse", "#diy", "#satisfying"],
};

// === Fungsi Utama ===
/**
 * Hasilkan JSON terstruktur dari Gemini API.
 * @param apiKey - API key Gemini (per kanal, dari vault)
 * @param tipe - jenis generate (untuk mock fixture)
 * @param systemPrompt - instruksi sistem (role definition, aturan output)
 * @param userPrompt - konteks spesifik (profil niche, ide, dsb.)
 * @param responseSchema - JSON schema untuk structured output
 */
export async function hasilkanJson<T>(
  apiKey: string | null,
  tipe: TipeGenerate,
  systemPrompt: string,
  userPrompt: string,
  responseSchema: Record<string, unknown>,
): Promise<T> {
  // Mode mock — tanpa API key
  if (process.env.GEMINI_MOCK === "1" || !apiKey) {
    console.log(`[GEMINI_MOCK] Mengembalikan fixture untuk tipe: ${tipe}`);
    return getMockFixture(tipe) as T;
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = process.env.GEMINI_TEXT_MODEL || "gemini-2.5-flash";

  const response = await ai.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseSchema: responseSchema as never,
      responseMimeType: "application/json",
      temperature: 0.8,
      maxOutputTokens: 4096,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini API mengembalikan respons kosong");
  }

  return JSON.parse(text) as T;
}

function getMockFixture(tipe: TipeGenerate): unknown {
  switch (tipe) {
    case "ide":
      return MOCK_IDE;
    case "prompt":
      return MOCK_PROMPT;
    case "caption":
      return MOCK_CAPTION;
    default:
      throw new Error(`Tipe mock tidak dikenal: ${tipe}`);
  }
}
