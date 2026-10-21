import Link from "next/link";
import { db } from "@/lib/db";
import { connection } from "next/server";
import { UI } from "@/lib/teks";

export const instant = false;

const EMOJI_KANAL: Record<string, string> = {
  sawdustsprint: "🪵",
  bloomblitz: "🌱",
  wildlapse: "🏕️",
};

const WARNA_KANAL: Record<string, { badge: string; bar: string; teks: string }> = {
  sawdustsprint: {
    badge: "bg-amber-100 text-amber-700",
    bar: "bg-amber-500",
    teks: "text-amber-600",
  },
  bloomblitz: {
    badge: "bg-emerald-100 text-emerald-700",
    bar: "bg-emerald-500",
    teks: "text-emerald-600",
  },
  wildlapse: {
    badge: "bg-orange-100 text-orange-700",
    bar: "bg-orange-500",
    teks: "text-orange-600",
  },
};

const LABEL_KS: Record<string, string> = {
  auto: UI.killSwitch.auto,
  review: UI.killSwitch.review,
  jeda: UI.killSwitch.jeda,
  ikut_global: UI.killSwitch.ikutGlobal,
};

const URUTAN_STATUS_ANALITIK = [
  "antrean_ide",
  "prompt_siap",
  "generating",
  "kotak_masuk_aset",
  "komposisi_overlay",
  "menunggu_review",
  "terjadwal",
  "tayang",
] as const;

const IKON_STATUS: Record<string, string> = {
  antrean_ide: "📥",
  prompt_siap: "📝",
  generating: "⚙️",
  kotak_masuk_aset: "📁",
  komposisi_overlay: "🎨",
  menunggu_review: "👀",
  terjadwal: "📅",
  tayang: "🚀",
  gagal: "❌",
};

function persen(n: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((n / total) * 100);
}

export default async function DashboardPage() {
  await connection();

  const awalHari = new Date(new Date().setUTCHours(0, 0, 0, 0));
  const tujuhHariLalu = new Date(Date.now() - 7 * 24 * 3600000);

  const [kanals, paketHariIni, ideTersedia, tayang7Hari, menungguReview, semuaPaket, peringatan, paketTerbaru] =
    await Promise.all([
      db.kanal.findMany({ orderBy: { nama: "asc" } }),
      db.paketKonten.count({ where: { createdAt: { gte: awalHari } } }),
      db.ide.count({ where: { status: "tersedia" } }),
      db.paketKonten.count({
        where: { status: "tayang", tayangPada: { gte: tujuhHariLalu } },
      }),
      db.paketKonten.findMany({
        where: { status: { in: ["menunggu_review", "gagal"] } },
        include: { ide: true, kanal: true },
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      db.paketKonten.findMany({ select: { status: true, kanalId: true } }),
      db.peringatan.findMany({
        where: { dibaca: false },
        orderBy: { createdAt: "desc" },
        take: 10,
      }),
      db.paketKonten.findMany({
        include: { ide: true, kanal: true },
        orderBy: { updatedAt: "desc" },
        take: 6,
      }),
    ]);

  const totalPaket = semuaPaket.length;
  const hitungStatus = (status: string) =>
    semuaPaket.filter((p) => p.status === status).length;
  const terjadwal = hitungStatus("terjadwal");
  // Progress target: 15 video/hari (5/kanal × 3 kanal)
  const progresHarian = Math.min(100, Math.round((paketHariIni / 15) * 100));

  const kanalDenganAntrean = kanals.map((k) => ({
    ...k,
    total: semuaPaket.filter((p) => p.kanalId === k.id).length,
  }));
  const kanalTeratas = [...kanalDenganAntrean].sort((a, b) => b.total - a.total);

  // Aktivitas terbaru dari paket yang paling baru diupdate + peringatan
  const aktivitas = [
    ...paketTerbaru.map((p) => ({
      id: `paket-${p.id}`,
      judul: p.ide?.judulEn ?? "Paket tanpa judul",
      sub: `${p.kanal.nama} · ${(UI.status as Record<string, string>)[p.status] ?? p.status}`,
      waktu: p.updatedAt,
      ikon: IKON_STATUS[p.status] ?? "📦",
      warna: "bg-blue-100",
    })),
    ...peringatan.slice(0, 3).map((p) => ({
      id: `peringatan-${p.id}`,
      judul: p.pesan,
      sub: "Peringatan sistem",
      waktu: p.createdAt,
      ikon: "⚠️",
      warna: "bg-amber-100",
    })),
  ]
    .sort((a, b) => +b.waktu - +a.waktu)
    .slice(0, 5);

  const tanggalHariIni = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* Hero banner gradien */}
      <section className="rounded-2xl bg-gradient-to-r from-[#1a56c4] to-[#0d2f7a] text-white p-6 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between shadow">
        <div>
          <h2 className="text-xl font-bold">
            {UI.dashboard.selamatDatang}
          </h2>
          <p className="text-sm text-white/80 mt-1">
            {tanggalHariIni} · {UI.dashboard.ringkasanHariIni}
          </p>
          <div className="flex gap-2 mt-4">
            <Link
              href="/ide"
              className="px-4 py-2 rounded-full bg-white text-[#14489b] text-sm font-semibold hover:bg-blue-50 transition-colors"
            >
              {UI.dashboard.ideBaru}
            </Link>
            <Link
              href="/jadwal"
              className="px-4 py-2 rounded-full border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
            >
              {UI.dashboard.lihatJadwal}
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {[
            { label: UI.dashboard.videoHariIni, nilai: String(paketHariIni), sub: `${progresHarian}% ${UI.dashboard.dariKemarin}` },
            { label: UI.dashboard.ideTersedia, nilai: String(ideTersedia), sub: UI.dashboard.baruHariIni },
            { label: UI.dashboard.tayang7Hari, nilai: String(tayang7Hari), sub: UI.dashboard.hariTerakhir },
            { label: UI.dashboard.terjadwal, nilai: String(terjadwal), sub: UI.dashboard.siapTayang },
          ].map((k) => (
            <div key={k.label} className="bg-white/10 rounded-xl px-4 py-3 backdrop-blur">
              <div className="text-[11px] text-white/70">{k.label}</div>
              <div className="text-2xl font-bold mt-1">{k.nilai}</div>
              <div className="text-[11px] text-white/60 mt-1">{k.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Kartu statistik */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          {
            label: UI.dashboard.videoHariIni,
            sub: `${paketHariIni} / 15 ${UI.dashboard.video}`,
            nilai: String(paketHariIni),
            ikon: "🎬",
            warnaIkon: "bg-blue-100",
            persen: progresHarian,
            warnaBar: "bg-blue-600",
            bawah: `${progresHarian}% ${UI.dashboard.dariKemarin}`,
          },
          {
            label: UI.dashboard.ideTersedia,
            sub: UI.dashboard.baruHariIni,
            nilai: String(ideTersedia),
            ikon: "💡",
            warnaIkon: "bg-amber-100",
            persen: Math.min(100, ideTersedia * 5),
            warnaBar: "bg-amber-500",
            bawah: `${ideTersedia} ${UI.dashboard.baruHariIni}`,
          },
          {
            label: UI.dashboard.menungguReview,
            sub: UI.dashboard.perluTindakan,
            nilai: String(menungguReview.length),
            ikon: "👀",
            warnaIkon: "bg-orange-100",
            persen: totalPaket > 0 ? persen(menungguReview.length, totalPaket) : 0,
            warnaBar: "bg-orange-500",
            bawah: UI.dashboard.perluTindakan,
          },
          {
            label: UI.dashboard.tayang7Hari,
            sub: `${UI.dashboard.hariTerakhir}`,
            nilai: String(tayang7Hari),
            ikon: "🚀",
            warnaIkon: "bg-emerald-100",
            persen: Math.min(100, tayang7Hari * 4),
            warnaBar: "bg-emerald-500",
            bawah: UI.dashboard.hariTerakhir,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <span className={`w-10 h-10 rounded-xl ${s.warnaIkon} flex items-center justify-center text-xl`}>
                {s.ikon}
              </span>
              <span className="text-[11px] text-emerald-600 font-medium">▲ live</span>
            </div>
            <div className="text-3xl font-bold text-slate-800 mt-3">{s.nilai}</div>
            <div className="text-xs text-slate-500 mt-1">{s.label}</div>
            <div className="text-[11px] text-slate-400">{s.sub}</div>
            <div className="mt-3">
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div className={`h-full rounded-full ${s.warnaBar}`} style={{ width: `${s.persen}%` }} />
              </div>
              <div className="text-[11px] text-slate-400 mt-1.5">{s.bawah}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Analitik + Aktivitas */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Analitik Pipeline */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{UI.dashboard.analitikPipeline}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{UI.dashboard.subAnalitik}</p>
            </div>
            <Link
              href="/jadwal"
              className="text-xs font-medium text-white bg-[#14489b] rounded-full px-3 py-1.5 hover:bg-[#0f3a82] transition-colors"
            >
              {UI.dashboard.lihatJadwal}
            </Link>
          </div>
          <div className="mt-5 space-y-4">
            {URUTAN_STATUS_ANALITIK.map((status) => {
              const n = hitungStatus(status);
              const pct = persen(n, totalPaket);
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-lg w-7 text-center">{IKON_STATUS[status]}</span>
                  <div className="w-36 shrink-0">
                    <div className="text-sm font-medium text-slate-700">
                      {(UI.status as Record<string, string>)[status] ?? status}
                    </div>
                    <div className="text-[11px] text-slate-400">{n} paket</div>
                  </div>
                  <div className="flex-1 h-8 rounded-lg bg-slate-100 overflow-hidden relative">
                    <div
                      className="h-full rounded-lg bg-gradient-to-r from-[#1a56c4] to-[#0d2f7a] flex items-center justify-end pr-2 transition-all"
                      style={{ width: `${Math.max(pct, n > 0 ? 8 : 0)}%` }}
                    >
                      {n > 0 && <span className="text-[11px] text-white font-semibold">{pct}%</span>}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-10 text-right">{n}</span>
                </div>
              );
            })}
          </div>
          {/* Ringkasan bawah */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            {[
              { label: UI.dashboard.videoHariIni, nilai: String(paketHariIni), warna: "text-blue-600 bg-blue-50" },
              { label: UI.dashboard.ideTersedia, nilai: String(ideTersedia), warna: "text-amber-600 bg-amber-50" },
              { label: UI.dashboard.terjadwal, nilai: String(terjadwal), warna: "text-emerald-600 bg-emerald-50" },
              { label: UI.dashboard.tayang7Hari, nilai: String(tayang7Hari), warna: "text-violet-600 bg-violet-50" },
            ].map((r) => (
              <div key={r.label} className={`rounded-xl px-4 py-3 ${r.warna}`}>
                <div className="text-xl font-bold">{r.nilai}</div>
                <div className="text-[11px] opacity-80">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Aktivitas Terbaru */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">{UI.dashboard.aktivitasTerbaru}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{UI.dashboard.subAktivitas}</p>
            </div>
            <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              {UI.dashboard.langsung}
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {aktivitas.length === 0 ? (
              <div className="text-sm text-slate-400">{UI.dashboard.belumAdaAktivitas}</div>
            ) : (
              aktivitas.map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full ${a.warna} flex items-center justify-center text-sm shrink-0`}>
                    {a.ikon}
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-slate-700 font-medium truncate">{a.judul}</div>
                    <div className="text-[11px] text-slate-400">{a.sub}</div>
                    <div className="text-[11px] text-slate-400">
                      {new Date(a.waktu).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link
            href="/jadwal"
            className="block text-center text-sm font-medium text-[#14489b] mt-4 hover:underline"
          >
            {UI.dashboard.lihatSemuaAktivitas}
          </Link>
        </div>
      </section>

      {/* Aksi Cepat + Kanal Teratas */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="font-bold text-slate-800">{UI.dashboard.aksiCepat}</h3>
          <p className="text-xs text-slate-500 mt-0.5 mb-4">{UI.dashboard.subAksiCepat}</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: UI.dashboard.ideBaru, sub: "Generate ide AI", href: "/ide", ikon: "💡", warna: "bg-[#14489b]" },
              { label: "Storyboard", sub: "Buat per cut", href: "/ide", ikon: "🎬", warna: "bg-emerald-500" },
              { label: UI.nav.aset, sub: "Upload video", href: "/aset", ikon: "📁", warna: "bg-orange-500" },
              { label: UI.nav.pengaturan, sub: "Kanal & kredensial", href: "/pengaturan", ikon: "⚙️", warna: "bg-violet-500" },
            ].map((a) => (
              <Link
                key={a.label + a.sub}
                href={a.href}
                className={`${a.warna} text-white rounded-xl p-4 hover:brightness-110 transition-all`}
              >
                <div className="text-2xl">{a.ikon}</div>
                <div className="font-semibold text-sm mt-2">{a.label}</div>
                <div className="text-[11px] text-white/80">{a.sub}</div>
              </Link>
            ))}
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">{UI.dashboard.kanalTeratas}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{UI.dashboard.subKanalTeratas}</p>
            </div>
            <Link href="/jadwal" className="text-xs font-medium text-[#14489b] hover:underline">
              {UI.dashboard.lihatSemua} →
            </Link>
          </div>
          <div className="space-y-3">
            {kanalTeratas.map((k) => {
              const w = WARNA_KANAL[k.slug] ?? {
                badge: "bg-slate-100 text-slate-600",
                bar: "bg-slate-400",
                teks: "text-slate-600",
              };
              const pct = persen(k.total, Math.max(totalPaket, 1));
              return (
                <Link
                  key={k.id}
                  href={`/kanal/${k.slug}`}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-blue-200 hover:bg-blue-50/40 transition-colors"
                >
                  <span className={`w-10 h-10 rounded-xl ${w.badge} flex items-center justify-center text-xl font-bold`}>
                    {EMOJI_KANAL[k.slug] ?? k.nama.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-slate-700 truncate">{k.nama}</span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {LABEL_KS[k.killSwitch] ?? k.killSwitch}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {k.handle} · {k.niche}
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div className={`h-full rounded-full ${w.bar}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`font-bold ${w.teks}`}>{k.total}</div>
                    <div className="text-[11px] text-slate-400">{UI.dashboard.paket}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Butuh Tindakan */}
      <section className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800">{UI.dashboard.butuhTindakan}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{UI.dashboard.subButuhTindakan}</p>
          </div>
          <span className="text-[11px] font-semibold text-red-600 bg-red-50 rounded-full px-3 py-1">
            🔴 {menungguReview.length} {UI.dashboard.menungguReview.toLowerCase()}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {[
            {
              judul: UI.dashboard.menungguReview,
              sub: `${menungguReview.length} ${UI.dashboard.paket} ${UI.dashboard.perluTindakan}`,
              ikon: "👀",
              warnaBox: "bg-orange-50 border-orange-100",
              warnaBtn: "bg-orange-500 hover:bg-orange-600",
              items: menungguReview.filter((p) => p.status === "menunggu_review"),
              href: "/jadwal",
            },
            {
              judul: "Gagal / Retry",
              sub: `${hitungStatus("gagal")} paket perlu perhatian`,
              ikon: "❌",
              warnaBox: "bg-red-50 border-red-100",
              warnaBtn: "bg-red-500 hover:bg-red-600",
              items: menungguReview.filter((p) => p.status === "gagal"),
              href: "/jadwal",
            },
            {
              judul: "Peringatan",
              sub: `${peringatan.length} peringatan belum dibaca`,
              ikon: "🔔",
              warnaBox: "bg-blue-50 border-blue-100",
              warnaBtn: "bg-[#14489b] hover:bg-[#0f3a82]",
              items: [],
              href: "/pengaturan",
            },
          ].map((b) => (
            <div key={b.judul} className={`rounded-2xl border p-5 ${b.warnaBox}`}>
              <div className="flex items-center justify-between">
                <span className="text-2xl">{b.ikon}</span>
                <span className="text-2xl font-bold text-slate-700">{b.items.length || (b.judul === "Peringatan" ? peringatan.length : 0)}</span>
              </div>
              <div className="font-bold text-slate-800 mt-2">{b.judul}</div>
              <div className="text-xs text-slate-500 mt-0.5">{b.sub}</div>
              {b.items.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {b.items.slice(0, 2).map((p) => (
                    <Link
                      key={p.id}
                      href={`/paket/${p.id}`}
                      className="block text-xs text-slate-600 bg-white/70 rounded-lg px-3 py-2 truncate hover:bg-white"
                    >
                      {p.ide?.judulEn ?? p.id}
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={b.href}
                className={`block text-center text-sm font-semibold text-white rounded-xl py-2.5 mt-4 transition-colors ${b.warnaBtn}`}
              >
                {UI.dashboard.tinjau} →
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
