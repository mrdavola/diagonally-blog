"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Hammer, Users, BookOpen } from "lucide-react"
import { addNewsletterSubscriber } from "@/lib/submissions"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const BENEFITS = [
  {
    icon: Hammer,
    title: "Build-in-Public Updates",
    desc: "Weekly progress on what we're shipping and why.",
  },
  {
    icon: Users,
    title: "Learner Stories",
    desc: "Real stories from real classrooms using Diagonally.",
  },
  {
    icon: BookOpen,
    title: "Education Insights",
    desc: "Thoughts on project-based learning, AI in education, and the future of math.",
  },
]

const PAST_ISSUES = [
  {
    title: "Week 1: We Shipped Wayfinder — Here's What Happened",
    date: "March 8, 2026",
    excerpt:
      "The first prototype went live. Eleven things broke. Three things surprised us in the best way possible.",
  },
  {
    title: "Week 2: The Pilot Is Booked — And We're Terrified",
    date: "March 22, 2026",
    excerpt:
      "We locked in 11 learners at Acton Academy Falls Church for our first real pilot. Here's everything we did to prepare.",
  },
  {
    title: "Week 3: What We Saw When We Got Out of the Way",
    date: "March 29, 2026",
    excerpt:
      "The pilot happened. Nobody asked permission to start. One kid pulled out Monopoly. This is what ownership looks like.",
  },
]

export default function NewsletterContent() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      // Client-side Firestore write
      await addNewsletterSubscriber(email)
      setSuccess(true)
      setEmail("")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Stay in the Loop
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Weekly updates on what we&rsquo;re building, learning, and shipping.
          </motion.p>
        </div>
      </section>

      {/* What You'll Get */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl font-bold text-text-dark text-center mb-12"
          >
            What you&rsquo;ll get
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BENEFITS.map((benefit, i) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={benefit.title}
                  {...fadeUp(i * 0.1)}
                  className="bg-cream rounded-2xl p-6"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-dark mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-text-dark/70 text-sm leading-relaxed">{benefit.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Signup Form */}
      <section className="bg-cream-dark py-24">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl font-bold text-text-dark mb-4"
          >
            Join the newsletter
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 mb-8"
          >
            Free, weekly, and actually worth reading.
          </motion.p>

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="py-6"
              >
                <p className="text-xl font-display font-bold text-text-dark mb-1">You&rsquo;re subscribed!</p>
                <p className="text-text-dark/60 text-sm">Look out for the next issue in your inbox.</p>
              </motion.div>
            ) : (
              <motion.div key="form" {...fadeUp(0.2)}>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 border border-text-dark/15 rounded-xl px-5 py-3.5 text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-emerald/50 transition bg-white text-base"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-emerald text-white font-semibold px-7 py-3.5 rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Subscribing…" : "Subscribe"}
                  </button>
                </form>
                {error && <p className="mt-2 text-red-600 text-sm">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.p {...fadeUp(0.3)} className="mt-4 text-sm text-text-dark/50">
            No spam. Unsubscribe anytime.
          </motion.p>
        </div>
      </section>

      {/* Past Issues */}
      <section className="bg-cream py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl font-bold text-text-dark mb-10"
          >
            Past Issues
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PAST_ISSUES.map((issue, i) => (
              <motion.div
                key={issue.title}
                {...fadeUp(i * 0.1)}
                className="bg-white rounded-2xl p-6 shadow-soft-sm"
              >
                <p className="text-xs font-semibold text-text-dark/40 mb-3">{issue.date}</p>
                <h3 className="font-display text-base font-bold text-text-dark leading-snug mb-3">
                  {issue.title}
                </h3>
                <p className="text-sm text-text-dark/60 leading-relaxed">{issue.excerpt}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
