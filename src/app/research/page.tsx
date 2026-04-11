import type { Metadata } from "next"
import ResearchContent from "@/components/pages/research-content"

export const metadata: Metadata = {
  title: "Research & Results — Diagonally",
  description:
    "Data from our pilot program and the research behind project-based math learning.",
}

export default function ResearchPage() {
  return <ResearchContent />
}
