"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { listPosts } from "@/lib/posts"
import type { PostDocument } from "@/lib/blocks/types"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const CATEGORIES = [
  "All",
  "Build-in-Public",
  "Learner Stories",
  "Education",
  "Product Updates",
]

const CATEGORY_BG: Record<string, string> = {
  "Build-in-Public": "bg-blue-primary/10",
  "Learner Stories": "bg-emerald/10",
  "Education": "bg-gold/10",
  "Product Updates": "bg-blue-deep/10",
}

function categoryBg(category: string): string {
  return CATEGORY_BG[category] ?? "bg-blue-primary/10"
}

function formatDate(date: Date | null): string {
  if (!date) return ""
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-soft-sm overflow-hidden animate-pulse">
      <div className="aspect-video bg-text-dark/8" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-24 bg-text-dark/8 rounded-full" />
        <div className="h-5 bg-text-dark/8 rounded-lg w-full" />
        <div className="h-5 bg-text-dark/8 rounded-lg w-4/5" />
        <div className="h-4 bg-text-dark/8 rounded-lg w-full mt-1" />
        <div className="h-4 bg-text-dark/8 rounded-lg w-3/4" />
        <div className="pt-4 border-t border-text-dark/5 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-text-dark/8 flex-shrink-0" />
          <div className="h-3 w-36 bg-text-dark/8 rounded-full" />
        </div>
      </div>
    </div>
  )
}

function SkeletonFeatured() {
  return (
    <div className="bg-white rounded-3xl shadow-soft-md overflow-hidden animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2">
        <div className="aspect-video md:aspect-auto min-h-64 bg-text-dark/8" />
        <div className="p-8 md:p-12 flex flex-col justify-center gap-4">
          <div className="h-5 w-28 bg-text-dark/8 rounded-full" />
          <div className="h-7 bg-text-dark/8 rounded-lg w-full" />
          <div className="h-7 bg-text-dark/8 rounded-lg w-4/5" />
          <div className="h-4 bg-text-dark/8 rounded-lg w-full" />
          <div className="h-4 bg-text-dark/8 rounded-lg w-full" />
          <div className="h-4 bg-text-dark/8 rounded-lg w-2/3" />
          <div className="pt-6 border-t border-text-dark/5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-text-dark/8 flex-shrink-0" />
            <div className="h-3 w-40 bg-text-dark/8 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Blog Card ────────────────────────────────────────────────────────────────

function BlogCard({
  post,
  index,
}: {
  post: PostDocument
  index: number
}) {
  const authorName = post.authorIds[0] || "Diagonally Team"
  const authorInitial = authorName[0]?.toUpperCase() ?? "D"

  return (
    <motion.div
      {...fadeUp(index * 0.08)}
      className="bg-white rounded-2xl shadow-soft-sm overflow-hidden hover:shadow-soft-md transition-shadow duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {/* Card image / placeholder */}
        <div className="aspect-video relative overflow-hidden">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className={`w-full h-full ${categoryBg(post.category)}`} />
          )}
        </div>

        <div className="p-6">
          <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full">
            {post.category || "Blog"}
          </span>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {post.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-text-dark/50 bg-text-dark/5 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-display text-lg font-bold text-text-dark mt-3 leading-snug">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-text-dark/70 mt-2 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-text-dark/5">
            <div className="w-6 h-6 rounded-full bg-blue-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-blue-primary">{authorInitial}</span>
            </div>
            <span className="text-xs text-text-dark/60 font-medium">
              {authorName}
              {post.readTimeMinutes > 0 && (
                <> &middot; {post.readTimeMinutes} min read</>
              )}
              {post.publishedAt && (
                <> &middot; {formatDate(post.publishedAt)}</>
              )}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Featured Post ────────────────────────────────────────────────────────────

function FeaturedCard({ post }: { post: PostDocument }) {
  const authorName = post.authorIds[0] || "Diagonally Team"
  const authorInitial = authorName[0]?.toUpperCase() ?? "D"

  return (
    <motion.div
      {...fadeUp(0)}
      className="bg-white rounded-3xl shadow-soft-md overflow-hidden"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Featured image / placeholder */}
          <div className="aspect-video md:aspect-auto min-h-64 relative overflow-hidden">
            {post.coverImage ? (
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className={`w-full h-full ${categoryBg(post.category)}`} />
            )}
          </div>

          <div className="p-8 md:p-12 flex flex-col justify-center">
            <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full w-fit">
              {post.category || "Blog"}
            </span>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {post.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs text-text-dark/50 bg-text-dark/5 px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <h2 className="font-display text-2xl font-bold text-text-dark mt-4 leading-snug">
              {post.title}
            </h2>
            {post.subtitle && (
              <p className="text-base text-text-dark/60 mt-1 font-body">{post.subtitle}</p>
            )}
            {post.excerpt && (
              <p className="text-text-dark/70 mt-4 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 pt-6 border-t border-text-dark/5">
              <div className="w-8 h-8 rounded-full bg-blue-primary/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-blue-primary">{authorInitial}</span>
              </div>
              <span className="text-sm text-text-dark/60 font-medium">
                {authorName}
                {post.readTimeMinutes > 0 && (
                  <> &middot; {post.readTimeMinutes} min read</>
                )}
                {post.publishedAt && (
                  <> &middot; {formatDate(post.publishedAt)}</>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export default function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [posts, setPosts] = useState<PostDocument[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPosts()
      .then((fetched) => {
        const published = fetched.filter((p) => p.status === "published")
        setPosts(published)
      })
      .catch(() => {
        setPosts([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const filteredPosts =
    activeCategory === "All"
      ? (posts ?? [])
      : (posts ?? []).filter((p) => p.category === activeCategory)

  // Only show categories that have at least one post
  const availableCategories = posts
    ? ["All", ...CATEGORIES.slice(1).filter((cat) =>
        posts.some((p) => p.category === cat)
      )]
    : CATEGORIES

  const featuredPost = posts && posts.length > 0 ? posts[0] : null
  const gridPosts = posts && posts.length > 1 ? filteredPosts.slice(activeCategory === "All" ? 1 : 0) : filteredPosts

  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Blog
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Build-in-public updates, learner stories, and education insights.
          </motion.p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          {loading ? (
            <SkeletonFeatured />
          ) : featuredPost ? (
            <FeaturedCard post={featuredPost} />
          ) : null}
        </div>
      </section>

      {/* Filter + Grid */}
      <section className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-6">
          {/* Category Pills */}
          <motion.div
            {...fadeUp(0)}
            className="flex flex-wrap gap-3 mb-12"
          >
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  activeCategory === cat
                    ? "bg-blue-deep text-white"
                    : "bg-white text-text-dark border border-text-dark/10 hover:border-blue-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* Post Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : gridPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post, i) => (
                <BlogCard key={post.slug} post={post} index={i} />
              ))}
            </div>
          ) : (
            <motion.div
              {...fadeUp(0)}
              className="text-center py-24"
            >
              <p className="font-display text-2xl font-bold text-text-dark/40">
                No posts yet
              </p>
              <p className="text-text-dark/40 mt-2 text-sm">
                {activeCategory !== "All"
                  ? `No posts in "${activeCategory}" yet.`
                  : "Check back soon."}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </>
  )
}
