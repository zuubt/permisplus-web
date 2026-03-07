import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PermisPlus — Prépare ton permis de conduire",
  description: "Apprends, pratique et obtiens ton permis de conduire au Togo",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1A5C38",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} font-sans antialiased bg-bg`}>
        <div className="min-h-screen flex justify-center bg-gray-200">
          <div className="w-full max-w-[430px] min-h-screen bg-bg relative overflow-hidden">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
