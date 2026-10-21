/**
 * Shell gelap lama untuk halaman non-dashboard (Ide, Jadwal, Aset, Kanal, Paket, Storyboard, Pengaturan).
 * Dipertahankan apa adanya agar halaman-halaman itu tetap berfungsi tanpa migrasi tema.
 */
import Link from "next/link";
import { UI } from "@/lib/teks";

const NAV_ITEMS = [
  { href: "/", label: UI.nav.dashboard, emoji: "📊" },
  { href: "/ide", label: UI.nav.ide, emoji: "💡" },
  { href: "/jadwal", label: UI.nav.jadwal, emoji: "📅" },
  { href: "/aset", label: UI.nav.aset, emoji: "📁" },
  { href: "/pengaturan", label: UI.nav.pengaturan, emoji: "⚙️" },
];

export default function GelapLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="bg-gray-950 text-gray-100 min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-56 bg-gray-900 border-r border-gray-800 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-white">⏱️ TimeLoom</h1>
          <p className="text-xs text-gray-500 mt-1">weave time-lapses</p>
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <span>{item.emoji}</span>
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="text-xs text-gray-600">3 kanal · 15 video/hari</div>
      </aside>

      {/* Main */}
      <main className="ml-56 p-6">{children}</main>
    </div>
  );
}
