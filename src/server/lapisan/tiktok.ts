/**
 * TikTok Content Posting API — Inbox mode fallback (FR-20, FR-20a).
 *
 * ⚠️ TikTok Direct Post API butuh approval aplikasi (tidak ada jaminan timeline).
 * Sampai disetujui: gunakan mode Inbox (draft masuk akun TikTok, operator tap publish manual).
 *
 * Mode Inbox = Content Posting API dengan `post_mode: "MEDIA_UPLOAD"` (draft, bukan direct publish).
 * Video + caption terkirim ke inbox akun TikTok, operator publish manual dari sana.
 *
 * FR-20a: Panel pengelolaan draft — daftar, status tracking, notifikasi pengingat.
 */
import { db } from "@/lib/db";
import { ambilKredensial } from "@/server/vault";
import { createReadStream } from "fs";
import { join } from "path";

const STORAGE_ROOT = process.env.STORAGE_ROOT || "./storage";

// Status draft TikTok (tracking per FR-20a)
export const STATUS_DRAFT = {
  TERUPLOAD: "terupload",       // sudah terkirim ke TikTok Inbox
  MENUNGGU_PUBLISH: "menunggu_publish", // menunggu operator tap publish
  SUDAH_TAYANG: "sudah_tayang", // operator sudah tap publish
} as const;

type StatusDraft = (typeof STATUS_DRAFT)[keyof typeof STATUS_DRAFT];

/**
 * Upload video ke TikTok Inbox (mode draft — operator publish manual).
 */
export async function uploadTiktokInbox(
  paketId: string,
): Promise<{ sukses: boolean; postId?: string; pesan: string; perluManual: boolean }> {
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
    return { sukses: false, pesan: "Belum ada video composed", perluManual: false };
  }

  const caption = paket.caption;
  if (!caption) {
    return { sukses: false, pesan: "Belum ada caption", perluManual: false };
  }

  const accessToken = await ambilKredensial(paket.kanalId, "tiktok_oauth", "access_token");
  const openId = await ambilKredensial(paket.kanalId, "tiktok_oauth", "open_id");

  if (!accessToken || !openId) {
    // Fallback: operator upload manual ke TikTok
    return {
      sukses: true,
      pesan: "TikTok API belum terhubung. Upload manual dari file composed.",
      perluManual: true,
    };
  }

  try {
    const filePath = join(STORAGE_ROOT, aset.pathFile);
    const hashtagStr = JSON.parse(caption.ttHashtag).join(" ");
    const deskripsi = `${caption.ttTeks} ${hashtagStr}`;

    // TikTok Content Posting API — PULL_FROM_URL / FILE_UPLOAD mode
    // POST https://open.tiktokapis.com/v2/post/publish/video/init/
    const initRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_info: {
            title: deskripsi.slice(0, 150),
            privacy_level: "SELF_ONLY", // draft — bukan public (Inbox mode)
            disable_duet: false,
            disable_comment: false,
            disable_stitch: false,
          },
          source_info: {
            source: "FILE_UPLOAD",
            video_size: aset.ukuranByte ?? 0,
          },
        }),
      },
    );

    const initData = await initRes.json();

    if (!initData.data?.publish_id) {
      return {
        sukses: false,
        pesan: `TikTok init gagal: ${initData.error?.message || "unknown"}`,
        perluManual: true,
      };
    }

    // Upload video chunk ke upload_url
    const uploadUrl = initData.data.upload_url;
    const fileStream = createReadStream(filePath);
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk as Buffer);
    }
    const fileBuffer = Buffer.concat(chunks);

    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": `bytes 0-${fileBuffer.length - 1}/${fileBuffer.length}`,
        "Content-Type": "video/mp4",
      },
      body: fileBuffer,
    });

    // Catat di tabel PaketKonten sebagai "menunggu publish" (FR-20a)
    await db.paketKonten.update({
      where: { id: paketId },
      data: {
        catatanProduksi: JSON.stringify({
          tiktok_publish_id: initData.data.publish_id,
          tiktok_status: STATUS_DRAFT.MENUNGGU_PUBLISH,
          catatan: "Draft di TikTok Inbox — operator perlu tap publish",
        }),
      },
    });

    return {
      sukses: true,
      postId: initData.data.publish_id,
      pesan: "Draft terkirim ke TikTok Inbox. Tap publish di TikTok.",
      perluManual: true,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Upload TikTok gagal";
    return { sukses: false, pesan: msg, perluManual: true };
  }
}

/**
 * Tandai draft TikTok sudah dipublish oleh operator (FR-20a).
 */
export async function tandaiSudahTayang(paketId: string): Promise<void> {
  const paket = await db.paketKonten.findUnique({ where: { id: paketId } });
  if (!paket) return;

  const catatan = paket.catatanProduksi ? JSON.parse(paket.catatanProduksi) : {};
  catatan.tiktok_status = STATUS_DRAFT.SUDAH_TAYANG;

  await db.paketKonten.update({
    where: { id: paketId },
    data: {
      catatanProduksi: JSON.stringify(catatan),
      tayangPada: paket.tayangPada ?? new Date(),
    },
  });
}

/**
 * Ambil daftar draft TikTok yang belum di-publish (FR-20a).
 */
export async function daftarDraftMenunggu() {
  const pakets = await db.paketKonten.findMany({
    where: {
      catatanProduksi: { contains: "menunggu_publish" },
    },
    include: {
      ide: true,
      kanal: true,
      caption: true,
      aset: { where: { jenis: "composed" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  return pakets.map((p) => {
    const catatan = p.catatanProduksi ? JSON.parse(p.catatanProduksi) : {};
    return {
      id: p.id,
      judul: p.ide?.judulEn,
      kanal: p.kanal.nama,
      kanalSlug: p.kanal.slug,
      status: catatan.tiktok_status || "menunggu_publish",
      tiktokPublishId: catatan.tiktok_publish_id,
      terjadwalPada: p.terjadwalPada,
      filePath: p.aset[0]?.pathFile,
    };
  });
}
