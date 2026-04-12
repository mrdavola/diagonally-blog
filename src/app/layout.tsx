import type { Metadata } from "next";
import { Bricolage_Grotesque, Nunito } from "next/font/google";
import "./globals.css";
import { LayoutShell } from "@/components/layout-shell";

const bricolage = Bricolage_Grotesque({
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
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Diagonally — Math Games Built By Students, For Students",
    description:
      "A math learning platform where students build games instead of taking tests. Powered by AI, driven by student creativity.",
    siteName: "Diagonally",
    type: "website",
    url: "https://diagonally.org",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagonally — Math Games Built By Students, For Students",
    description:
      "A math learning platform where students build games instead of taking tests.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${nunito.variable}`}
    >
      <body className="font-body antialiased bg-cream text-text-dark">
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
