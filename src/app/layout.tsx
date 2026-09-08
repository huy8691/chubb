import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

const lato = localFont({
  variable: "--font-lato",
  display: "swap",
  src: [
    { path: "../../public/font/lato-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/font/lato-400i.woff2", weight: "400", style: "italic" },
    { path: "../../public/font/lato-500.woff2", weight: "500", style: "normal" },
    { path: "../../public/font/lato-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/font/lato-700.woff2", weight: "700", style: "normal" },
  ],
});

const publico = localFont({
  variable: "--font-publico",
  display: "swap",
  src: [
    { path: "../../public/font/publico-400.woff2", weight: "400", style: "normal" },
    { path: "../../public/font/publico-600.woff2", weight: "600", style: "normal" },
    { path: "../../public/font/publico-700.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Chubb Life — Toàn Tâm · E-Card 2.0",
  description: "Bản demo Advisor Portal E-Card 2.0 (Exnodes + P2P)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${lato.variable} ${publico.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
