import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "A-Stocks Tactical Dashboard",
  description: "Tactical investing dashboard for market regime and fair-value analysis.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-zinc-950 text-zinc-100">{children}</body>
    </html>
  );
}
