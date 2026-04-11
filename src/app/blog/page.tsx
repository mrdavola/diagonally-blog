import type { Metadata } from "next"
import BlogContent from "@/components/pages/blog-content"

export const metadata: Metadata = {
  title: "Blog — Diagonally",
  description:
    "Build-in-public updates, learner stories, and education insights from the Diagonally team.",
  openGraph: {
    title: "Blog — Diagonally",
    description:
      "Build-in-public updates, learner stories, and education insights from the Diagonally team.",
    url: "https://diagonally.org/blog",
    siteName: "Diagonally",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Diagonally",
    description:
      "Build-in-public updates, learner stories, and education insights from the Diagonally team.",
  },
}

export default function BlogPage() {
  return <BlogContent />
}
