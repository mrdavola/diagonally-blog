import type { Metadata } from "next"
import FirestorePageWrapper from "@/components/firestore-page-wrapper"
import SchoolsContent from "@/components/pages/schools-content"

export const metadata: Metadata = {
  title: "For Schools — Diagonally",
  description:
    "Bring Diagonally to your classroom. AI-powered math games, galaxy progress tracking, and a platform built for learners.",
  openGraph: {
    title: "For Schools — Diagonally",
    description:
      "Bring Diagonally to your classroom. AI-powered math games, galaxy progress tracking, and a platform built for learners.",
    url: "https://diagonally.org/schools",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Schools — Diagonally",
    description:
      "Bring Diagonally to your classroom. AI-powered math games, galaxy progress tracking, and a platform built for learners.",
  },
}

export default function SchoolsPage() {
  return (
    <FirestorePageWrapper slug="schools" fallback={<SchoolsContent />} loadingBg="bg-space-deep" />
  )
}
