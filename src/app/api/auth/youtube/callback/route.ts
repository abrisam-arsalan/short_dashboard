import { NextRequest } from "next/server";
import { prosesCallback } from "@/server/lapisan/youtube";

/**
 * GET /api/auth/youtube/callback — OAuth callback dari Google.
 * Exchange code → tokens → simpan di vault.
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const kanalId = url.searchParams.get("state"); // kanalId dikirim via state

    if (!code || !kanalId) {
      return Response.json({ error: "Code atau state tidak ditemukan" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;

    await prosesCallback(code, kanalId, redirectUri);

    // Redirect ke halaman pengaturan dengan pesan sukses
    return Response.redirect(`${baseUrl}/pengaturan?yt=connected`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "OAuth callback gagal";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return Response.redirect(`${baseUrl}/pengaturan?yt=error&msg=${encodeURIComponent(msg)}`);
  }
}
