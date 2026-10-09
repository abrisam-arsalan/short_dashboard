/**
 * Analytics Worker Handler (M4).
 * Sinkronisasi YouTube + TikTok analytics + generate Playbook Niche.
 */
import { syncYoutubeAnalytics, syncTiktokAnalytics, deteksiFormatSukses } from "@/server/lapisan/analytics";
import { generatePlaybook } from "@/server/lapisan/playbook";
import { db } from "@/lib/db";

export async function handleSyncAnalytics() {
  console.log(`📊 [Analytics] Sinkronisasi...`);

  const yt = await syncYoutubeAnalytics();
  console.log(`   YouTube: ${yt.pesan}`);

  const tt = await syncTiktokAnalytics();
  console.log(`   TikTok: ${tt.pesan}`);

  // Generate Playbook Niche per kanal
  const kanals = await db.kanal.findMany();
  for (const kanal of kanals) {
    const playbook = await generatePlaybook(kanal.id);
    if (playbook.totalVideo > 0) {
      console.log(
        `   Playbook ${kanal.nama}: ${playbook.totalVideo} video, avg ${playbook.rataViewsKanal} views`,
      );
    }
  }

  // Deteksi Format Sukses (FR-26)
  for (const kanal of kanals) {
    const sukses = await deteksiFormatSukses(kanal.id);
    if (sukses.length > 0) {
      console.log(`   🏆 Format Sukses ${kanal.nama}: ${sukses.length} video`);
    }
  }
}
