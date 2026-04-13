import type { Metadata } from "next"
import HomeContent from "@/components/pages/home-content"

export const metadata: Metadata = {
  title: "Diagonally — Math Games Built By Students, For Students",
  description:
    "An AI-powered math platform where K-12 students build games instead of taking tests. Piloted at Acton Academy. Think Diagonally.",
  openGraph: {
    title: "Diagonally — Math Games Built By Students, For Students",
    description:
      "An AI-powered math platform where K-12 students build games instead of taking tests. Piloted at Acton Academy. Think Diagonally.",
    url: "https://diagonally.org",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Diagonally — Math Games Built By Students, For Students",
    description:
      "An AI-powered math platform where K-12 students build games instead of taking tests. Piloted at Acton Academy. Think Diagonally.",
  },
}

export default function HomePage() {
  return <HomeContent />
}
