/**
 * Seed data — 3 kanal + ProfilNiche + 5 SlotJadwal per kanal + Setelan default.
 * Idempotent: bisa dijalankan berulang kali (pakai upsert).
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Slot waktu default: 10:00 / 13:00 / 17:00 / 20:00 / 23:00 UTC
// (mencakup US pagi, US sore, EU sore/malam)
const SLOT_UTC = [600, 780, 1020, 1200, 1380]; // menit sejak tengah malam UTC

// Offset per kanal (menit) agar tidak bentrok antar kanal (FR-18)
const OFFSET_KANAL: Record<string, number> = {
  sawdustsprint: 0,
  bloomblitz: 7,
  wildlapse: 14,
};

const KANAL_DATA = [
  {
    slug: "sawdustsprint",
    nama: "SawdustSprint",
    handle: "@sawdustsprint",
    niche: "pertukangan",
    profil: {
      topik: JSON.stringify([
        "woodworking projects",
        "DIY furniture",
        "handcrafted wood items",
        "wood joinery",
        "furniture restoration",
      ]),
      audiens: "US/Eropa, English",
      tone: "satisfying, precise, warm craftsmanship",
      kataKunciEn: JSON.stringify([
        "woodworking",
        "DIY",
        "time lapse",
        "satisfying",
        "craftsmanship",
        "handmade",
        "furniture",
        "woodshop",
      ]),
      larangan: "teks/watermark di video, orang menghadap kamera, potongan kamera",
      spesimenGaya:
        "fast-motion time-lapse, satisfying transformation, hyper-detailed wood grain, warm workshop aesthetic",
      // Gaya overlay (FR-15): Condensed bold, palet kayu/amber
      fontFile: "fonts/BarlowCondensed-Bold.ttf",
      fontWeight: "bold",
      warnaTeks: "#F2A93B",
      warnaBox: "#1A120BCC",
      radiusBox: 4,
      toneHook: "pendek, tegas, dramatis",
      contohHook: "3 weeks of work → 6 seconds",
    },
  },
  {
    slug: "bloomblitz",
    nama: "BloomBlitz",
    handle: "@bloomblitz",
    niche: "gardening",
    profil: {
      topik: JSON.stringify([
        "garden transformations",
        "plant growth time-lapse",
        "harvest reveals",
        "flower blooming",
        "raised bed gardening",
      ]),
      audiens: "US/Eropa, English",
      tone: "organic, gentle, awe of nature",
      kataKunciEn: JSON.stringify([
        "gardening",
        "time lapse",
        "satisfying",
        "plants",
        "grow",
        "harvest",
        "blooming",
        "nature",
      ]),
      larangan: "teks/watermark di video, orang menghadap kamera, potongan kamera",
      spesimenGaya:
        "fast-motion time-lapse, satisfying transformation, hyper-detailed natural textures, soft organic aesthetic",
      // Gaya overlay (FR-15): Rounded soft, hijau/earth tone
      fontFile: "fonts/Quicksand-Bold.ttf",
      fontWeight: "bold",
      warnaTeks: "#7CB342",
      warnaBox: "#1B2E1BCC",
      radiusBox: 24,
      toneHook: "lembut, penuh keajaiban, singkat",
      contohHook: "From bare soil to THIS 🌱",
    },
  },
  {
    slug: "wildlapse",
    nama: "WildLapse",
    handle: "@wildlapse",
    niche: "camping",
    profil: {
      topik: JSON.stringify([
        "campsite setup time-lapse",
        "outdoor shelter building",
        "campfire cooking",
        "forest camp transformation",
        "wilderness survival setup",
      ]),
      audiens: "US/Eropa, English",
      tone: "rugged, adventurous, wilderness spirit",
      kataKunciEn: JSON.stringify([
        "camping",
        "outdoor",
        "time lapse",
        "wilderness",
        "campfire",
        "adventure",
        "survival",
        "nature",
      ]),
      larangan: "teks/watermark di video, orang menghadap kamera, potongan kamera",
      spesimenGaya:
        "fast-motion time-lapse, satisfying transformation, rugged outdoor atmosphere, dramatic natural lighting",
      // Gaya overlay (FR-15): Rugged stencil/slab, hijau gelap/oranye api
      fontFile: "fonts/BlackOpsOne-Regular.ttf",
      fontWeight: "bold",
      warnaTeks: "#FF6D00",
      warnaBox: "#0D1F0DCC",
      radiusBox: 0,
      toneHook: "tegas, petualangan, singkat kuat",
      contohHook: "Home in 30 seconds 🏕️",
    },
  },
];

const SETELAN_DEFAULT = [
  { key: "killswitch_global", value: "auto" },
  { key: "retensi_raw_hari", value: "7" },
  { key: "retensi_composed_hari", value: "30" },
];

async function main() {
  console.log("🌱 Seeding database TimeLoom...");

  for (const data of KANAL_DATA) {
    const offset = OFFSET_KANAL[data.slug] ?? 0;

    // Upsert kanal
    const kanal = await db.kanal.upsert({
      where: { slug: data.slug },
      update: { nama: data.nama, handle: data.handle, niche: data.niche },
      create: {
        slug: data.slug,
        nama: data.nama,
        handle: data.handle,
        niche: data.niche,
      },
    });

    // Upsert profil niche
    await db.profilNiche.upsert({
      where: { kanalId: kanal.id },
      update: data.profil,
      create: { kanalId: kanal.id, ...data.profil },
    });

    // Upsert 5 slot jadwal
    for (let i = 0; i < 5; i++) {
      await db.slotJadwal.upsert({
        where: { kanalId_slotKe: { kanalId: kanal.id, slotKe: i } },
        update: { menitUtc: SLOT_UTC[i] + offset },
        create: {
          kanalId: kanal.id,
          slotKe: i,
          menitUtc: SLOT_UTC[i] + offset,
        },
      });
    }

    console.log(`  ✅ ${data.nama} (${data.slug}) — ${data.niche}`);
  }

  // Setelan global
  for (const s of SETELAN_DEFAULT) {
    await db.setelan.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("  ✅ Setelan global");
  console.log("🌱 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
