import type { Metadata } from "next"
import FirestorePageWrapper from "@/components/firestore-page-wrapper"
import AboutContent from "@/components/pages/about-content"

export const metadata: Metadata = {
  title: "About — Diagonally",
  description:
    "Meet the team behind Diagonally. 30+ years in education and tech, building the future of math learning.",
  openGraph: {
    title: "About — Diagonally",
    description:
      "Meet the team behind Diagonally. 30+ years in education and tech, building the future of math learning.",
    url: "https://diagonally.org/about",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About — Diagonally",
    description:
      "Meet the team behind Diagonally. 30+ years in education and tech, building the future of math learning.",
  },
}

export default function AboutPage() {
  return (
    <FirestorePageWrapper slug="about" fallback={<AboutContent />} loadingBg="bg-cream" />
  )
}
