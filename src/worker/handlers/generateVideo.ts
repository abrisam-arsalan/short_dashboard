/**
 * Mode Auto Worker Handler (M3).
 * Trigger: paket di status "prompt_siap" + kanal modeProduksi="auto".
 * Hasilkan video via Gemini Omni Flash API → langsung ke pipeline.
 */
import { generateVideoAuto } from "@/server/lapisan/omniFlash";

export async function handleGenerateVideo(paketId: string) {
  console.log(`🎬 [Auto] Generate video ${paketId}...`);
  const hasil = await generateVideoAuto(paketId);

  if (!hasil.sukses) {
    console.error(`   ❌ ${hasil.pesan}`);
    return;
  }

  console.log(`   ✅ ${hasil.pesan}`);
}
