import type { Metadata } from "next"
import BlogPostContent from "@/components/pages/blog-post-content"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
  return {
    title: `${title} — Diagonally Blog`,
    description: "Read this post on the Diagonally blog.",
    openGraph: {
      title: `${title} — Diagonally Blog`,
      description: "Read this post on the Diagonally blog.",
      url: `https://diagonally.org/blog/${slug}`,
      siteName: "Diagonally",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} — Diagonally Blog`,
      description: "Read this post on the Diagonally blog.",
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  return <BlogPostContent slug={slug} />
}
