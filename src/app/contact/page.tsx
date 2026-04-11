import type { Metadata } from "next"
import ContactContent from "@/components/pages/contact-content"

export const metadata: Metadata = {
  title: "Contact — Diagonally",
  description:
    "Whether you're a school, parent, partner, or journalist — we'd love to hear from you.",
}

export default function ContactPage() {
  return <ContactContent />
}
