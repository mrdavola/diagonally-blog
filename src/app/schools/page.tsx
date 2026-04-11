import type { Metadata } from "next"
import SchoolsContent from "@/components/pages/schools-content"

export const metadata: Metadata = {
  title: "For Schools — Diagonally",
  description: "Bring Diagonally to your classroom. An AI-powered platform where your students build math games and prove they understand the concepts.",
}

export default function SchoolsPage() {
  return <SchoolsContent />
}
