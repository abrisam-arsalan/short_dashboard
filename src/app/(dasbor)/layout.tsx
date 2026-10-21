/**
 * Shell dashboard gaya template admin (terang):
 * sidebar biru + topbar (judul, search, waktu, notifikasi) + konten kartu putih.
 */
import Link from "next/link";
import { connection } from "next/server";
import { db } from "@/lib/db";
import { UI } from "@/lib/teks";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", ikon: "▦" },
  { href: "/ide", label: UI.nav.ide, ikon: "💡" },
  { href: "/jadwal", label: UI.nav.jadwal, ikon: "📅" },
  { href: "/aset", label: UI.nav.aset, ikon: "📁" },
  { href: "/pengaturan", label: UI.nav.pengaturan, ikon: "⚙️" },
];

export default async function DasborLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const jumlahPeringatan = await db.peringatan.count({ where: { dibaca: false } });

  return (
    <div className="min-h-screen bg-[#f3f5f9]">
      <div className="flex min-h-screen">
        {/* Sidebar biru */}
        <aside className="w-52 shrink-0 bg-[#14489b] text-white flex flex-col rounded-r-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
                ⏱️
              </span>
              <div>
                <div className="font-bold text-sm leading-tight">TimeLoom</div>
                <div className="text-[10px] text-white/70">Admin Panel</div>
              </div>
            </div>
            <span className="text-white/60 text-lg leading-none">×</span>
          </div>

          <nav className="px-3 space-y-1 flex-1">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  i === 0
                    ? "bg-white/20 text-white font-medium"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="w-5 text-center">{item.ikon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2.5">
              <span className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-xs">
                👤
              </span>
              <div className="leading-tight">
                <div className="text-xs font-medium">Operator</div>
                <div className="text-[10px] text-white/70">3 kanal · 15 video/hari</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Kolom kanan: topbar + konten */}
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="flex items-center justify-between px-6 py-4">
            <div>
              <h1 className="text-lg font-bold text-slate-800">Dashboard</h1>
              <p className="text-xs text-slate-500">{UI.dashboard.kelola}</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 text-sm text-slate-500 shadow-sm">
                <span>🔍</span>
                <input
                  placeholder={UI.dashboard.cari}
                  className="bg-transparent outline-none text-slate-700 placeholder:text-slate-400 w-40"
                />
              </label>
              <span className="text-xs text-slate-500 bg-white border border-slate-200 rounded-full px-3 py-2 shadow-sm">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <button
                aria-label="Notifikasi"
                className="relative w-9 h-9 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center"
              >
                🔔
                {jumlahPeringatan > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {jumlahPeringatan > 9 ? "9+" : jumlahPeringatan}
                  </span>
                )}
              </button>
              <span className="w-9 h-9 rounded-full bg-[#14489b] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                O
              </span>
            </div>
          </header>

          <main className="px-6 pb-8 space-y-5">{children}</main>
        </div>
      </div>
    </div>
  );
}
