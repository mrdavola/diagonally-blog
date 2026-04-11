import type { Metadata } from "next";
import { Syne, Nunito } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Diagonally — Math Games Built By Students, For Students",
  description:
    "A math learning platform where students build games instead of taking tests. Powered by AI, driven by student creativity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${nunito.variable}`}
    >
      <body className="font-body antialiased bg-cream text-text-dark">
        {children}
      </body>
    </html>
  );
}
