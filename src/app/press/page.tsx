import type { Metadata } from "next"
import PressContent from "@/components/pages/press-content"

export const metadata: Metadata = {
  title: "Press — Diagonally",
  description:
    "Resources for journalists and media covering Diagonally.",
}

export default function PressPage() {
  return <PressContent />
}
