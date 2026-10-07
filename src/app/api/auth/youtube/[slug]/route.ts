import { NextRequest } from "next/server";
import { buatAuthUrl } from "@/server/lapisan/youtube";

/**
 * GET /api/auth/youtube/[slug] — Mulai OAuth flow YouTube.
 * Redirect ke Google consent screen.
 */
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await ctx.params;
    const { db } = await import("@/lib/db");
    const kanal = await db.kanal.findUnique({ where: { slug } });
    if (!kanal) {
      return Response.json({ error: "Kanal tidak ditemukan" }, { status: 404 });
    }

    // Redirect URI: callback endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/auth/youtube/callback`;

    const authUrl = await buatAuthUrl(kanal.id, redirectUri);
    return Response.redirect(authUrl);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Gagal membuat auth URL";
    return Response.json({ error: msg }, { status: 500 });
  }
}
