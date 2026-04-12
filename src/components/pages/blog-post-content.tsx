"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const RELATED_POSTS = [
  {
    slug: "11-learners-one-challenge",
    category: "Learner Stories",
    title: "11 Learners, One Challenge: What Happened When We Let Students Choose",
    excerpt:
      "We gave learners one rule: pick a math concept and build a game. What happened next surprised everyone.",
    author: "Barbara Kinoti",
    date: "March 28, 2026",
    gradient: "from-blue-primary/20 to-emerald/20",
  },
  {
    slug: "ownership-moment",
    category: "Learner Stories",
    title: "The Ownership Moment: When a Learner Debugs Their Own Game",
    excerpt:
      "One learner iterated six times with the AI to fix her game before running out of time. She didn't ask for help.",
    author: "Scott Yeoman",
    date: "March 27, 2026",
    gradient: "from-emerald/20 to-blue-primary/20",
  },
  {
    slug: "project-based-learning-research",
    category: "Education",
    title: "The Research Behind Project-Based Learning in Math",
    excerpt:
      "Decades of studies point in the same direction: students who build, create, and teach learn more deeply.",
    author: "Barbara Kinoti",
    date: "March 15, 2026",
    gradient: "from-emerald/20 to-gold/20",
  },
]

interface BlogPostContentProps {
  slug: string
}

export default function BlogPostContent({ slug }: BlogPostContentProps) {
  const titleFromSlug = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

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
            <Link href="/" className="hover:text-blue-deep transition-colors">Home</Link>
            <ChevronRight size={14} />
            <Link href="/blog" className="hover:text-blue-deep transition-colors">Blog</Link>
            <ChevronRight size={14} />
            <span className="text-text-dark/80 truncate max-w-[200px]">{titleFromSlug}</span>
          </motion.nav>

          <motion.span
            {...fadeUp(0.05)}
            className="inline-block bg-blue-primary/10 text-blue-primary text-xs font-semibold px-3 py-1 rounded-full"
          >
            Build-in-Public
          </motion.span>
          <motion.h1
            {...fadeUp(0.1)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark mt-4 leading-tight"
          >
            {titleFromSlug}
          </motion.h1>
          <motion.div
            {...fadeUp(0.2)}
            className="flex items-center gap-4 mt-6"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-primary to-emerald flex-shrink-0" />
            <div>
              <p className="font-semibold text-text-dark text-sm">Mike Chen</p>
              <p className="text-text-dark/50 text-xs">
                Co-founder &middot; April 3, 2026 &middot; 6 min read
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Article Body */}
      <article className="max-w-3xl mx-auto px-6 py-12">
        <motion.div {...fadeUp(0)} className="space-y-6">
          <p className="text-lg leading-relaxed text-text-dark">
            When we decided to build Diagonally in public, we didn&rsquo;t have a roadmap — just a conviction that transparency creates accountability, and that the people we&rsquo;re building for deserve to see how the sausage gets made. That decision has shaped everything from our development cadence to how we think about failure.
          </p>

          <p className="text-lg leading-relaxed text-text-dark">
            The first prototype, Wayfinder 1.0, launched on March 7th. It was rough. The interface was clunky, the AI interactions were inconsistent, and our user flows had gaps you could drive a truck through. We shipped it anyway — because waiting for perfect means waiting forever, and because we needed real learners, not hypothetical ones.
          </p>

          <h2 className="font-display text-2xl font-bold text-text-dark mt-8 mb-4">
            What the Pilot Taught Us
          </h2>

          <p className="text-lg leading-relaxed text-text-dark">
            Eleven learners at Acton Academy Falls Church walked into our pilot on March 26th with one instruction: pick a math concept you care about and build a game around it. No rubrics. No teacher prompts. No starter templates. We watched what happened when we just got out of the way.
          </p>

          <blockquote className="border-l-4 border-gold pl-6 italic text-xl text-text-dark/80 leading-relaxed my-8">
            &ldquo;One group pulled out Monopoly on their own to look for where math already lives inside a game. Nobody told them to do that.&rdquo;
          </blockquote>

          <p className="text-lg leading-relaxed text-text-dark">
            The pattern we saw repeated itself across every group: when learners have real ownership over the problem, the motivation is intrinsic. They don&rsquo;t need to be managed into engagement. They need to be trusted with it. Diagonally&rsquo;s design philosophy — letting learners choose their topic, build their game, and demonstrate mastery through creation — is built around this insight.
          </p>

          <h2 className="font-display text-2xl font-bold text-text-dark mt-8 mb-4">
            Building the Galaxy
          </h2>

          <p className="text-lg leading-relaxed text-text-dark">
            We&rsquo;re mapping 480 Common Core math standards into a 3D galaxy visualization — not because it&rsquo;s flashy, but because spatial navigation changes how learners relate to the curriculum. When you can see the whole map and choose your own star, the curriculum becomes yours. That&rsquo;s the shift we&rsquo;re after. Not gamification. Ownership.
          </p>

          <p className="text-lg leading-relaxed text-text-dark">
            We&rsquo;ll keep building in public. Every sprint, every shipped feature, every learning that surprises us — it goes here. If you&rsquo;re building something in education, in edtech, or just trying to figure out how AI and learning fit together, we want to hear from you.
          </p>
        </motion.div>
      </article>

      {/* Read More */}
      <section className="bg-cream py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-2xl font-bold text-text-dark mb-8"
          >
            Keep Reading
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RELATED_POSTS.map((post, i) => (
              <motion.div
                key={post.slug}
                {...fadeUp(i * 0.08)}
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
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-primary to-emerald flex-shrink-0" />
                      <span className="text-xs text-text-dark/60 font-medium">
                        {post.author} &middot; {post.date}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
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
    </>
  )
}
