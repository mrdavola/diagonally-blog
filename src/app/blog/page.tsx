import type { Metadata } from "next"
import BlogContent from "@/components/pages/blog-content"

export const metadata: Metadata = {
  title: "Blog — Diagonally",
  description:
    "Build-in-public updates, learner stories, and education insights from the Diagonally team.",
}

export default function BlogPage() {
  return <BlogContent />
}
