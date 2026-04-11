import type { Metadata } from "next"
import AboutContent from "@/components/pages/about-content"

export const metadata: Metadata = {
  title: "About — Diagonally",
  description: "Meet the team behind Diagonally — educators and builders who saw kids' curiosity fade and decided to do something about it.",
}

export default function AboutPage() {
  return <AboutContent />
}
