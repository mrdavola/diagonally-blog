"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { getPost, listPosts } from "@/lib/posts"
import { getAuthor } from "@/lib/authors"
import { isTiptapContent } from "@/lib/blocks/types"
import type { PostDocument, Author } from "@/lib/blocks/types"
import { TiptapRenderer } from "@/components/blog/tiptap-renderer"
import { LegacyRenderer } from "@/components/blog/legacy-renderer"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

function formatDate(date: Date | null): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface RelatedPostCardProps {
  post: PostDocument
  index: number
}

function RelatedPostCard({ post, index }: RelatedPostCardProps) {
  return (
    <motion.div
      {...fadeUp(index * 0.08)}
      className="bg-white rounded-2xl shadow-soft-sm overflow-hidden hover:shadow-soft-md transition-shadow duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        {post.coverImage ? (
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        ) : (
          <div className="bg-gradient-to-br from-blue-primary/20 to-emerald/20 aspect-video" />
        )}
        <div className="p-6">
          <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full">
            {post.category || "Blog"}
          </span>
          <h3 className="font-display text-lg font-bold text-text-dark mt-3 leading-snug">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-text-dark/70 mt-2 leading-relaxed line-clamp-3">
              {post.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-text-dark/5">
            <span className="text-xs text-text-dark/60 font-medium">
              {formatDate(post.publishedAt)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

interface BlogPostContentProps {
  slug: string
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const [post, setPost] = useState<PostDocument | null | undefined>(undefined)
  const [author, setAuthor] = useState<Author | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<PostDocument[]>([])

  useEffect(() => {
    getPost(slug)
      .then(async (fetchedPost) => {
        setPost(fetchedPost)

        if (!fetchedPost) return

        // Track view
        fetch(`/api/posts/${slug}/view`, { method: "POST" }).catch(() => {})

        // Fetch author
        if (fetchedPost.authorIds?.[0]) {
          getAuthor(fetchedPost.authorIds[0])
            .then((a) => setAuthor(a))
            .catch(() => {})
        }

        // Fetch related posts (same category, exclude current, limit 3)
        listPosts(fetchedPost.category)
          .then((posts) => {
            const related = posts
              .filter(
                (p) => p.slug !== slug && p.status === "published"
              )
              .slice(0, 3)
            setRelatedPosts(related)
          })
          .catch(() => {})
      })
      .catch(() => setPost(null))
  }, [slug])

  // Loading state
  if (post === undefined) {
    return (
      <section className="bg-cream min-h-[60vh] flex items-center justify-center">
        <div className="text-text-dark/40 font-body text-lg">Loading…</div>
      </section>
    )
  }

  // Not found or not published
  if (!post || post.status !== "published") {
    return (
      <section className="bg-cream min-h-[60vh] flex items-center justify-center">
        <div className="text-center px-6">
          <p className="font-display text-5xl font-bold text-text-dark mb-4">
            404
          </p>
          <p className="text-text-dark/60 mb-8">
            This post doesn&rsquo;t exist or hasn&rsquo;t been published yet.
          </p>
          <Link
            href="/blog"
            className="inline-block bg-blue-deep text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            Back to Blog
          </Link>
        </div>
      </section>
    )
  }

  const content = post.publishedContent

  return (
    <>
      {/* Header */}
      <section className="bg-cream py-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Breadcrumb */}
          <motion.nav
            {...fadeUp(0)}
            className="flex items-center gap-1.5 text-sm text-text-dark/50 mb-6"
          >
            <Link href="/blog" className="hover:text-blue-deep transition-colors">
              Blog
            </Link>
            {post.category && (
              <>
                <ChevronRight size={14} />
                <span className="text-text-dark/80">{post.category}</span>
              </>
            )}
          </motion.nav>

          {/* Category Badge */}
          {post.category && (
            <motion.span
              {...fadeUp(0.05)}
              className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full"
            >
              {post.category}
            </motion.span>
          )}

          {/* Title */}
          <motion.h1
            {...fadeUp(0.1)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark mt-4 leading-tight"
          >
            {post.title}
          </motion.h1>

          {/* Subtitle */}
          {post.subtitle && (
            <motion.p
              {...fadeUp(0.15)}
              className="text-xl text-text-dark/60 mt-3 leading-relaxed"
            >
              {post.subtitle}
            </motion.p>
          )}

          {/* Author + Meta */}
          <motion.div
            {...fadeUp(0.2)}
            className="flex items-center gap-4 mt-6"
          >
            {author?.headshot ? (
              <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={author.headshot}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-primary to-emerald flex-shrink-0 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {author?.name?.[0] ?? "D"}
                </span>
              </div>
            )}
            <div>
              {author && (
                <p className="font-semibold text-text-dark text-sm">{author.name}</p>
              )}
              <p className="text-text-dark/50 text-xs">
                {author?.role && <span>{author.role} &middot; </span>}
                {formatDate(post.publishedAt)}
                {post.readTimeMinutes > 0 && (
                  <span> &middot; {post.readTimeMinutes} min read</span>
                )}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="max-w-4xl mx-auto px-6 -mt-4 mb-4">
          <motion.div
            {...fadeUp(0.25)}
            className="relative aspect-video rounded-2xl overflow-hidden"
          >
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 896px) 100vw, 896px"
            />
          </motion.div>
        </div>
      )}

      {/* Article Content */}
      <motion.article
        {...fadeUp(0.3)}
        className="max-w-prose mx-auto px-6 py-12"
      >
        {content ? (
          isTiptapContent(content) ? (
            <TiptapRenderer content={content} />
          ) : (
            <LegacyRenderer blocks={content} />
          )
        ) : (
          <p className="text-text-dark/40 italic">No content yet.</p>
        )}
      </motion.article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-cream py-16">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              {...fadeUp(0)}
              className="font-display text-2xl font-bold text-text-dark mb-8"
            >
              Keep Reading
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((related, i) => (
                <RelatedPostCard key={related.slug} post={related} index={i} />
              ))}
            </div>

            <motion.div {...fadeUp(0.3)} className="mt-10 text-center">
              <Link
                href="/blog"
                className="inline-block bg-blue-deep text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
              >
                View All Posts
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </>
  )
}
