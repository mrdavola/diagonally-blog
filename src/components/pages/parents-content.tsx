"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Minus } from "lucide-react"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const STEPS = [
  {
    number: "01",
    title: "Your child picks a math topic",
    description: "They explore a galaxy of concepts and choose one that interests them.",
  },
  {
    number: "02",
    title: "They build a game with AI help",
    description: "An AI guide helps them design and create a real, playable game.",
  },
  {
    number: "03",
    title: "They master it by playing peers' games",
    description: "Playing games other kids built reinforces the learning.",
  },
]

const FAQS = [
  {
    question: "What ages is Diagonally for?",
    answer:
      "Diagonally covers K-12 math standards, so it works for children from around ages 5 through 18. The AI guide adapts to each learner's level and pace.",
  },
  {
    question: "Is the AI safe for my child?",
    answer:
      "Yes. The AI guide is specifically designed for educational use, with age-appropriate language, no external browsing, and guardrails that keep conversations focused on learning.",
  },
  {
    question: "How much screen time does it require?",
    answer:
      "A typical session is 30–60 minutes. Diagonally is designed to be engaging but not addictive — learners build, reflect, and share rather than passively scroll.",
  },
  {
    question: "How is this different from Khan Academy?",
    answer:
      "Khan Academy uses a linear curriculum where students watch videos and answer questions. Diagonally lets students build games that prove they understand a concept — active creation, not passive consumption. No two learners follow the same path.",
  },
  {
    question: "How much does it cost for families?",
    answer:
      "We're currently focused on school partnerships. Family pricing is coming soon — join the waitlist to be first to know.",
  },
]

const GRADES = [
  "Kindergarten",
  "1st Grade",
  "2nd Grade",
  "3rd Grade",
  "4th Grade",
  "5th Grade",
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
]

export default function ParentsContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    grade: "",
    source: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formState.name,
          email: formState.email,
          type: "waitlist",
          message: "",
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setSuccess(true)
      setFormState({ name: "", email: "", grade: "", source: "" })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Watch Your Child Think Diagonally
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Your child won&rsquo;t just learn math — they&rsquo;ll build games that prove they get it.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="bg-emerald text-space-deep rounded-xl px-8 py-3.5 font-semibold hover:bg-emerald/90 transition-colors duration-200"
            >
              Join the Waitlist
            </a>
            <a
              href="#how-it-works"
              className="border-2 border-text-dark/20 text-text-dark rounded-xl px-8 py-3.5 font-semibold hover:bg-text-dark/5 transition-colors duration-200"
            >
              See How It Works
            </a>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            How It Works
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                {...fadeUp(i * 0.12)}
                className="bg-cream rounded-3xl p-8 shadow-soft-sm"
              >
                <div className="w-12 h-12 rounded-full bg-blue-primary flex items-center justify-center mb-5">
                  <span className="font-display font-bold text-white text-sm">{step.number}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text-dark mb-3">
                  {step.title}
                </h3>
                <p className="text-text-dark/60 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll See */}
      <section className="bg-white py-24 md:py-32 border-t border-border">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-6"
          >
            Track Your Child&rsquo;s Progress
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 text-center text-lg mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Parents get a dedicated dashboard showing which concepts your child has explored, what games they&rsquo;ve built, and where they&rsquo;ve proven mastery.
          </motion.p>

          {/* Dashboard Placeholder */}
          <motion.div
            {...fadeUp(0.2)}
            className="rounded-3xl bg-space-mid/5 aspect-video flex items-center justify-center border border-border"
          >
            <span className="text-text-dark/30 text-sm font-medium">Parent Dashboard Preview</span>
          </motion.div>

          <motion.div
            {...fadeUp(0.3)}
            className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center"
          >
            {[
              { label: "Concepts Explored", description: "See every topic your child has visited in the galaxy map." },
              { label: "Games Built", description: "Browse all the games they've created and share them with family." },
              { label: "Mastery Milestones", description: "Track which skills they've proven through peer gameplay." },
            ].map((item, i) => (
              <div key={i} className="bg-cream rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-text-dark mb-2">{item.label}</h3>
                <p className="text-text-dark/60 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="bg-cream-dark py-24 md:py-32">
        <div className="max-w-xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4"
          >
            Join the Waitlist
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 text-center mb-12 text-lg leading-relaxed"
          >
            We&rsquo;ll let you know when Diagonally is available for families.
          </motion.p>

          <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center"
            >
              <p className="text-2xl font-display font-bold text-text-dark mb-2">You&rsquo;re on the list!</p>
              <p className="text-text-dark/60">We&rsquo;ll reach out when Diagonally is ready for families.</p>
            </motion.div>
          ) : (
          <motion.form
            key="form"
            {...fadeUp(0.2)}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label htmlFor="parent-name" className="block text-sm font-medium text-text-dark mb-2">
                Your Name
              </label>
              <input
                id="parent-name"
                type="text"
                value={formState.name}
                onChange={(e) => setFormState((s) => ({ ...s, name: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                placeholder="Alex Johnson"
              />
            </div>
            <div>
              <label htmlFor="parent-email" className="block text-sm font-medium text-text-dark mb-2">
                Email
              </label>
              <input
                id="parent-email"
                type="email"
                value={formState.email}
                onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                placeholder="alex@email.com"
              />
            </div>
            <div>
              <label htmlFor="parent-grade" className="block text-sm font-medium text-text-dark mb-2">
                Child&rsquo;s Grade
              </label>
              <select
                id="parent-grade"
                value={formState.grade}
                onChange={(e) => setFormState((s) => ({ ...s, grade: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
              >
                <option value="">Select grade…</option>
                {GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="parent-source" className="block text-sm font-medium text-text-dark mb-2">
                How did you hear about us?
              </label>
              <select
                id="parent-source"
                value={formState.source}
                onChange={(e) => setFormState((s) => ({ ...s, source: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
              >
                <option value="">Select…</option>
                <option value="social-media">Social Media</option>
                <option value="friend-family">Friend/Family</option>
                <option value="school">School</option>
                <option value="other">Other</option>
              </select>
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald text-space-deep rounded-xl px-8 py-4 font-semibold hover:bg-emerald/90 transition-colors duration-200 font-display text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Joining…" : "Join the Waitlist"}
            </button>
          </motion.form>
          )}
          </AnimatePresence>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            Frequently Asked Questions
          </motion.h2>

          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                {...fadeUp(i * 0.06)}
                className="bg-white rounded-2xl shadow-soft-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-display font-semibold text-text-dark pr-4">
                    {faq.question}
                  </span>
                  {openFaq === i ? (
                    <Minus className="w-5 h-5 text-blue-primary flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-blue-primary flex-shrink-0" />
                  )}
                </button>

                <div
                  style={{
                    display: "grid",
                    gridTemplateRows: openFaq === i ? "1fr" : "0fr",
                    transition: "grid-template-rows 0.25s ease-in-out",
                  }}
                >
                  <div style={{ overflow: "hidden" }}>
                    <div className="px-6 pb-5">
                      <p className="text-text-dark/60 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
