"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
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

const FEATURED_POST = {
  slug: "why-we-build-in-public",
  category: "Build-in-Public",
  title: "Why We Build Diagonally in Public — and What We've Learned So Far",
  excerpt:
    "From prototype to pilot in 30 days. We share everything: our wins, our failures, and the unexpected lessons from watching 11 kids build math games.",
  author: "Mike Chen",
  date: "April 3, 2026",
}

const POSTS = [
  {
    slug: "11-learners-one-challenge",
    category: "Learner Stories",
    title: "11 Learners, One Challenge: What Happened When We Let Students Choose",
    excerpt:
      "We gave learners one rule: pick a math concept and build a game. What happened next surprised everyone in the room.",
    author: "Barbara Kinoti",
    date: "March 28, 2026",
    gradient: "from-blue-primary/20 to-emerald/20",
  },
  {
    slug: "480-standards-one-galaxy",
    category: "Product Updates",
    title: "480 Standards, One Galaxy: Building the Math Concept Map",
    excerpt:
      "How we visualized every Common Core math standard as a navigable 3D star map — and why spatial metaphors matter for learner agency.",
    author: "Scott Yeoman",
    date: "March 20, 2026",
    gradient: "from-gold/20 to-blue-primary/20",
  },
  {
    slug: "project-based-learning-research",
    category: "Education",
    title: "The Research Behind Project-Based Learning in Math",
    excerpt:
      "Decades of studies point in the same direction: students who build, create, and teach learn more deeply. Here's what the evidence says.",
    author: "Barbara Kinoti",
    date: "March 15, 2026",
    gradient: "from-emerald/20 to-gold/20",
  },
  {
    slug: "ai-game-builder-v1",
    category: "Build-in-Public",
    title: "Shipping the AI Game Builder: What We Got Right and Wrong",
    excerpt:
      "Version 1 of our AI game builder launched on March 17th. Here's an honest post-mortem on what worked, what broke, and what we'd do differently.",
    author: "Mike Chen",
    date: "March 18, 2026",
    gradient: "from-blue-primary/20 to-gold/20",
  },
  {
    slug: "ownership-moment",
    category: "Learner Stories",
    title: "The Ownership Moment: When a Learner Debugs Their Own Game",
    excerpt:
      "One learner iterated six times with the AI to fix her game before running out of time. She didn't ask for help. She just kept going.",
    author: "Scott Yeoman",
    date: "March 27, 2026",
    gradient: "from-emerald/20 to-blue-primary/20",
  },
  {
    slug: "wayfinder-prototype",
    category: "Build-in-Public",
    title: "Wayfinder 1.0: Our First Prototype and What We Learned",
    excerpt:
      "The very first version of Diagonally was called Wayfinder. It launched on March 7th. Here's everything we shipped and everything we scrapped.",
    author: "Mike Chen",
    date: "March 8, 2026",
    gradient: "from-gold/20 to-emerald/20",
  },
]

function BlogCard({
  post,
  index,
}: {
  post: (typeof POSTS)[0]
  index: number
}) {
  return (
    <motion.div
      {...fadeUp(index * 0.08)}
      className="bg-white rounded-2xl shadow-soft-sm overflow-hidden hover:shadow-soft-md transition-shadow duration-300"
    >
      <Link href={`/blog/${post.slug}`} className="block">
        <div
          className={`bg-gradient-to-br ${post.gradient} aspect-video`}
        />
        <div className="p-6">
          <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full">
            {post.category}
          </span>
          <h3 className="font-display text-lg font-bold text-text-dark mt-3 leading-snug">
            {post.title}
          </h3>
          <p className="text-sm text-text-dark/70 mt-2 leading-relaxed line-clamp-3">
            {post.excerpt}
          </p>
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-text-dark/5">
            <div className="w-6 h-6 rounded-full bg-blue-primary/15 flex items-center justify-center flex-shrink-0"><span className="text-xs font-bold text-blue-primary">{post.author[0]}</span></div>
            <span className="text-xs text-text-dark/60 font-medium">
              {post.author} &middot; {post.date}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function BlogContent() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [firestorePosts, setFirestorePosts] = useState<PostDocument[] | null>(null)

  useEffect(() => {
    listPosts()
      .then((posts) => {
        if (posts.length > 0) setFirestorePosts(posts)
      })
      .catch(() => {})
  }, [])

  // If Firestore has published posts, use those; otherwise use hardcoded placeholders
  const allPosts = firestorePosts
    ? firestorePosts
        .filter((p) => p.status === "published")
        .map((p) => ({
          slug: p.slug,
          category: p.category || "Build-in-Public",
          title: p.title,
          excerpt: p.excerpt || "",
          author: p.authorIds[0] || "Diagonally Team",
          date: p.publishedAt
            ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : "",
          gradient: "from-blue-primary/20 to-emerald/20",
        }))
    : POSTS

  const filteredPosts =
    activeCategory === "All"
      ? allPosts
      : allPosts.filter((p) => p.category === activeCategory)

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
          <motion.div
            {...fadeUp(0)}
            className="bg-white rounded-3xl shadow-soft-md overflow-hidden"
          >
            <Link href={`/blog/${FEATURED_POST.slug}`} className="block">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-primary/20 to-emerald/20 aspect-video md:aspect-auto min-h-64" />
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <span className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full w-fit">
                    {FEATURED_POST.category}
                  </span>
                  <h2 className="font-display text-2xl font-bold text-text-dark mt-4 leading-snug">
                    {FEATURED_POST.title}
                  </h2>
                  <p className="text-text-dark/70 mt-4 leading-relaxed">
                    {FEATURED_POST.excerpt}
                  </p>
                  <div className="flex items-center gap-3 mt-6 pt-6 border-t border-text-dark/5">
                    <div className="w-8 h-8 rounded-full bg-blue-primary/15 flex items-center justify-center flex-shrink-0"><span className="text-sm font-bold text-blue-primary">{FEATURED_POST.author[0]}</span></div>
                    <span className="text-sm text-text-dark/60 font-medium">
                      {FEATURED_POST.author} &middot; {FEATURED_POST.date}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
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
            {CATEGORIES.map((cat) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, i) => (
              <BlogCard key={post.slug} post={post} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
