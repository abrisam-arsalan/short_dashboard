/**
 * YouTube Data API v3 — OAuth 2.0 + Upload (FR-19).
 * 1 akun Google = 1 kanal = 1 OAuth client (FR-6).
 *
 * Alur OAuth:
 *   1. GET /api/auth/youtube/[slug] → redirect ke Google consent
 *   2. GET /api/auth/youtube/callback → exchange code → simpan token di vault
 *   3. Upload pakai access_token (auto-refresh via refresh_token)
 */
import { google } from "googleapis";
import { ambilKredensial, simpanKredensial } from "@/server/vault";
import { db } from "@/lib/db";
import { createReadStream } from "fs";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";
const SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"];

// === OAuth Client per kanal ===
function getOAuthClient(clientId: string, clientSecret: string, redirectUri: string) {
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/** Generate URL persetujuan OAuth untuk satu kanal */
export async function buatAuthUrl(kanalId: string, redirectUri: string): Promise<string> {
  const clientId = await ambilKredensial(kanalId, "youtube_oauth", "client_id");
  const clientSecret = await ambilKredensial(kanalId, "youtube_oauth", "client_secret");

  if (!clientId || !clientSecret) {
    throw new Error("Client ID/Secret YouTube belum diset. Set di Pengaturan → Kredensial.");
  }

  const oauth2Client = getOAuthClient(clientId, clientSecret, redirectUri);

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent", // force consent untuk dapat refresh_token
    state: kanalId, // untuk identifikasi kanal di callback
  });
}

/** Exchange authorization code → tokens → simpan di vault */
export async function prosesCallback(
  code: string,
  kanalId: string,
  redirectUri: string,
): Promise<void> {
  const clientId = await ambilKredensial(kanalId, "youtube_oauth", "client_id");
  const clientSecret = await ambilKredensial(kanalId, "youtube_oauth", "client_secret");

  if (!clientId || !clientSecret) {
    throw new Error("Client ID/Secret YouTube belum diset.");
  }

  const oauth2Client = getOAuthClient(clientId, clientSecret, redirectUri);
  const { tokens } = await oauth2Client.getToken(code);

  if (tokens.access_token) {
    await simpanKredensial(kanalId, "youtube_oauth", "access_token", tokens.access_token);
  }
  if (tokens.refresh_token) {
    await simpanKredensial(kanalId, "youtube_oauth", "refresh_token", tokens.refresh_token);
  }
  if (tokens.expiry_date) {
    await simpanKredensial(kanalId, "youtube_oauth", "expiry_date", String(tokens.expiry_date));
  }
}

/** Ambil access_token yang valid (auto-refresh bila expired) */
async function getValidAccessToken(kanalId: string): Promise<string> {
  const accessToken = await ambilKredensial(kanalId, "youtube_oauth", "access_token");
  const refreshToken = await ambilKredensial(kanalId, "youtube_oauth", "refresh_token");
  const expiryDate = await ambilKredensial(kanalId, "youtube_oauth", "expiry_date");

  if (!accessToken) {
    throw new Error("YouTube belum terhubung. Lakukan OAuth di Pengaturan.");
  }

  // Cek expiry
  const now = Date.now();
  const expiry = expiryDate ? parseInt(expiryDate, 10) : 0;

  if (now < expiry - 60000) {
    return accessToken; // masih valid (buffer 1 menit)
  }

  // Perlu refresh
  if (!refreshToken) {
    throw new Error("Refresh token tidak ditemukan. Lakukan OAuth ulang.");
  }

  const clientId = await ambilKredensial(kanalId, "youtube_oauth", "client_id");
  const clientSecret = await ambilKredensial(kanalId, "youtube_oauth", "client_secret");
  const oauth2Client = getOAuthClient(clientId!, clientSecret!, "");
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await oauth2Client.refreshAccessToken();

  if (credentials.access_token) {
    await simpanKredensial(kanalId, "youtube_oauth", "access_token", credentials.access_token);
  }
  if (credentials.expiry_date) {
    await simpanKredensial(kanalId, "youtube_oauth", "expiry_date", String(credentials.expiry_date));
  }

  return credentials.access_token!;
}

/** Upload video ke YouTube Shorts */
export async function uploadYoutube(
  paketId: string,
): Promise<{ sukses: boolean; videoId?: string; pesan: string }> {
  const paket = await db.paketKonten.findUniqueOrThrow({
    where: { id: paketId },
    include: {
      caption: true,
      aset: { where: { jenis: "composed" }, orderBy: { createdAt: "desc" }, take: 1 },
      kanal: true,
    },
  });

  const aset = paket.aset[0];
  if (!aset) {
    return { sukses: false, pesan: "Belum ada video composed untuk diupload" };
  }

  const caption = paket.caption;
  if (!caption) {
    return { sukses: false, pesan: "Belum ada caption untuk diupload" };
  }

  try {
    const accessToken = await getValidAccessToken(paket.kanalId);
    const clientId = await ambilKredensial(paket.kanalId, "youtube_oauth", "client_id");
    const clientSecret = await ambilKredensial(paket.kanalId, "youtube_oauth", "client_secret");
    const oauth2Client = getOAuthClient(clientId!, clientSecret!, "");
    oauth2Client.setCredentials({ access_token: accessToken });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });

    const filePath = join(STORAGE_ROOT, aset.pathFile);
    const hashtagStr = JSON.parse(caption.ytHashtag).join(" ");

    const res = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: caption.ytJudul.slice(0, 100),
          description: `${caption.ytDeskripsi}\n\n${hashtagStr}`,
          categoryId: "24", // Entertainment
        },
        status: {
          privacyStatus: "public",
          selfDeclaredMadeForKids: false,
          // YouTube Shorts: < 60 detik, 9:16 → auto-detected as Shorts
        },
      },
      media: {
        body: createReadStream(filePath),
      },
    });

    const videoId = res.data.id;
    if (!videoId) {
      return { sukses: false, pesan: "Upload berhasil tapi videoId kosong" };
    }

    // Update status paket → tayang
    await db.paketKonten.update({
      where: { id: paketId },
      data: { status: "tayang", tayangPada: new Date() },
    });

    return { sukses: true, videoId, pesan: `YouTube: https://youtube.com/shorts/${videoId}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload YouTube gagal";
    return { sukses: false, pesan: msg };
  }
}

/** Cek status koneksi YouTube per kanal */
export async function statusKoneksi(kanalId: string) {
  const accessToken = await ambilKredensial(kanalId, "youtube_oauth", "access_token");
  const refreshToken = await ambilKredensial(kanalId, "youtube_oauth", "refresh_token");
  return {
    terhubung: !!accessToken,
    punyaRefreshToken: !!refreshToken,
  };
}
