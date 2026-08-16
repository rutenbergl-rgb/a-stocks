import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-Stocks Tactical Dashboard",
  description: "Tactical market-regime and fair-value dashboard",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <body className="min-h-full bg-zinc-950 text-zinc-100">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <header className="mb-6 flex items-center justify-between">
            <Link href="/" className="text-lg font-bold tracking-tight">
              A-Stocks Tactical Dashboard
            </Link>
            <nav className="flex items-center gap-4 text-sm text-zinc-300">
              <Link href="/">Market</Link>
              <Link href="/watchlist">Watchlist</Link>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
