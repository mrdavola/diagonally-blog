"use client"

interface BlogPostContentProps {
  slug: string
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")

  return (
    <section className="bg-cream py-24 min-h-screen">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text-dark">{title}</h1>
        <p className="mt-6 text-text-dark/50">Coming soon.</p>
      </div>
    </section>
  )
}
