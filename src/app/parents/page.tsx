import type { Metadata } from "next"
import ParentsContent from "@/components/pages/parents-content"

export const metadata: Metadata = {
  title: "For Parents — Diagonally",
  description:
    "Watch your child think diagonally. A math platform where kids build games and prove they understand.",
  openGraph: {
    title: "For Parents — Diagonally",
    description:
      "Watch your child think diagonally. A math platform where kids build games and prove they understand.",
    url: "https://diagonally.org/parents",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "For Parents — Diagonally",
    description:
      "Watch your child think diagonally. A math platform where kids build games and prove they understand.",
  },
}

export default function ParentsPage() {
  return <ParentsContent />
}
