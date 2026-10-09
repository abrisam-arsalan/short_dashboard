/**
 * Feedback Loop — inject Playbook Niche ke prompt generator ide (M4, FR-27).
 * Dipanggil oleh generateIde() sebelum request ke Gemini API.
 */
import { generatePlaybook, renderPlaybookUntukPrompt } from "./playbook";

export async function ambilPlaybookSlot(kanalId: string): Promise<string> {
  try {
    const playbook = await generatePlaybook(kanalId);
    return renderPlaybookUntukPrompt(playbook);
  } catch {
    return "// Playbook Niche: tidak tersedia";
  }
}
