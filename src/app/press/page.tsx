import type { Metadata } from "next"
import FirestorePageWrapper from "@/components/firestore-page-wrapper"
import PressContent from "@/components/pages/press-content"

export const metadata: Metadata = {
  title: "Press — Diagonally",
  description:
    "Press resources, brand assets, and company information for journalists covering Diagonally.",
  openGraph: {
    title: "Press — Diagonally",
    description:
      "Press resources, brand assets, and company information for journalists covering Diagonally.",
    url: "https://diagonally.org/press",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Press — Diagonally",
    description:
      "Press resources, brand assets, and company information for journalists covering Diagonally.",
  },
}

export default function PressPage() {
  return (
    <FirestorePageWrapper slug="press" fallback={<PressContent />} loadingBg="bg-cream" />
  )
}
