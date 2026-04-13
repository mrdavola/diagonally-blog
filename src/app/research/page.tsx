import type { Metadata } from "next"
import FirestorePageWrapper from "@/components/firestore-page-wrapper"
import ResearchContent from "@/components/pages/research-content"

export const metadata: Metadata = {
  title: "Research & Results — Diagonally",
  description:
    "Data from our pilot program and the research behind project-based math learning.",
  openGraph: {
    title: "Research & Results — Diagonally",
    description:
      "Data from our pilot program and the research behind project-based math learning.",
    url: "https://diagonally.org/research",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Research & Results — Diagonally",
    description:
      "Data from our pilot program and the research behind project-based math learning.",
  },
}

export default function ResearchPage() {
  return (
    <FirestorePageWrapper slug="research" fallback={<ResearchContent />} loadingBg="bg-cream" />
  )
}
