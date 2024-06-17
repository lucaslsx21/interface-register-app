import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Auto Elétrica Martins",
  description: "Fechamento de folha para Auto Elétrica",
  manifest: "./webmanifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className="bg-[#CEDDEB] text-[#403C3D]">{children}</body>
    </html>
  );
}
