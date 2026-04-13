import type { Metadata } from "next"
import ContactContent from "@/components/pages/contact-content"

export const metadata: Metadata = {
  title: "Contact — Diagonally",
  description: "Get in touch with the Diagonally team.",
  openGraph: {
    title: "Contact — Diagonally",
    description: "Get in touch with the Diagonally team.",
    url: "https://diagonally.org/contact",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact — Diagonally",
    description: "Get in touch with the Diagonally team.",
  },
}

export default function ContactPage() {
  return <ContactContent />
}
