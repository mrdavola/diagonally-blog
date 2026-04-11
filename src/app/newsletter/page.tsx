import type { Metadata } from "next"
import NewsletterContent from "@/components/pages/newsletter-content"

export const metadata: Metadata = {
  title: "Newsletter — Diagonally",
  description: "Weekly updates on what we're building, learning, and shipping.",
  openGraph: {
    title: "Newsletter — Diagonally",
    description: "Weekly updates on what we're building, learning, and shipping.",
    url: "https://diagonally.org/newsletter",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Newsletter — Diagonally",
    description: "Weekly updates on what we're building, learning, and shipping.",
  },
}

export default function NewsletterPage() {
  return <NewsletterContent />
}
