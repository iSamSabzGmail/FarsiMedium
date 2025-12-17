import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazir = Vazirmatn({ subsets: ["arabic"] });

export const metadata: Metadata = {
  title: "Farsi Medium | مدیوم فارسی",
  description: "بهترین مقالات تکنولوژی جهان به زبان فارسی",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazir.className} bg-[#050505] text-white`}>
        {children}
      </body>
    </html>
  );
}