import type { Metadata } from "next"
import ParentsContent from "@/components/pages/parents-content"

export const metadata: Metadata = {
  title: "For Parents — Diagonally",
  description: "Your child won't just learn math — they'll build games that prove they get it. Join the waitlist for Diagonally.",
}

export default function ParentsPage() {
  return <ParentsContent />
}
