import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TimeLoom — Pusat Komando",
  description: "Dashboard & otomasi multi-akun YouTube Shorts & TikTok",
};

/**
 * Root layout netral — tidak mengatur tema/sidebar.
 * Tema + sidebar diatur per route group:
 *   - (dasbor): shell terang gaya template admin
 *   - (gelap): shell gelap lama (halaman operasional)
 */
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
