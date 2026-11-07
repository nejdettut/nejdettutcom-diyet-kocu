import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Diyet Koçu — nejdettut.com",
  description:
    "Gün içinde yenileni serbest metin olarak yaz: yapay zekâ kalori hesaplar, beslenme dengesi analizi yapar ve hedefine göre 7 günlük beslenme planı önerir.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
