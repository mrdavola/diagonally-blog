"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Users, Shield, RefreshCw, Check } from "lucide-react"
import { Constellation } from "@/components/constellation"
import { WaveDivider } from "@/components/wave-divider"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const WHAT_YOU_GET = [
  {
    icon: Sparkles,
    title: "Full AI Ecosystem",
    description: "Access for learners, parents, and guides. Everything they need in one platform.",
  },
  {
    icon: Users,
    title: "High-Touch Onboarding",
    description: "We configure workspaces, cohorts, and starter projects with you.",
  },
  {
    icon: Shield,
    title: "Managed Infrastructure",
    description: "Cloud hosting, security, and uptime. You focus on teaching.",
  },
  {
    icon: RefreshCw,
    title: "Continuous Iteration",
    description: "Ongoing support and weekly module updates throughout the year.",
  },
]

const WHY_US = [
  {
    title: "Speed",
    description: "We ship new modules weekly.",
  },
  {
    title: "Personalization",
    description: "Student profiles and AI feedback become uniquely theirs.",
  },
  {
    title: "Data",
    description: "Learner paths accumulate, building smarter feedback at scale.",
  },
]

export default function SchoolsContent() {
  const [formState, setFormState] = useState({
    schoolName: "",
    yourName: "",
    role: "",
    email: "",
    numStudents: "",
    message: "",
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
          name: formState.yourName,
          email: formState.email,
          type: "demo",
          message: formState.message,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }
      setSuccess(true)
      setFormState({ schoolName: "", yourName: "", role: "", email: "", numStudents: "", message: "" })
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-space-deep py-24 md:py-32 overflow-hidden">
        <Constellation className="absolute inset-0" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-white"
          >
            Bring Diagonally to Your Classroom
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-light/80 max-w-2xl mx-auto leading-relaxed"
          >
            An AI-powered platform where your students build math games — and prove they understand the concepts.
          </motion.p>
          <motion.div {...fadeUp(0.3)} className="mt-10">
            <a
              href="#demo-form"
              className="bg-blue-deep text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-blue-deep/90 transition-colors duration-200 inline-block"
            >
              Request a Demo
            </a>
          </motion.div>
        </div>
      </section>

      <WaveDivider topColor="#080c18" bottomColor="#faf7f2" />

      {/* What Your School Gets */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            What Your School Gets
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {WHAT_YOU_GET.map((item, i) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.title}
                  {...fadeUp(i * 0.1)}
                  className="bg-white rounded-3xl p-8 shadow-soft-md hover:shadow-soft-lg transition-shadow duration-300"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-blue-primary" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-text-dark mb-2">
                    {item.title}
                  </h3>
                  <p className="text-text-dark/60 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 text-center mb-16 text-lg"
          >
            Pick the plan that fits your school.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Pilot */}
            <motion.div
              {...fadeUp(0)}
              className="bg-white rounded-3xl p-8 shadow-soft-md border border-border"
            >
              <h3 className="font-display text-2xl font-bold text-text-dark">Pilot</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-text-dark">$250</span>
              </div>
              <p className="text-text-dark/50 mt-1 text-sm">30-day pilot</p>
              <ul className="mt-8 space-y-3">
                {["Up to 25 learners", "Full platform access", "Onboarding sessions", "Feedback sessions included"].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-text-dark/70">
                    <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#demo-form"
                className="mt-8 block text-center border-2 border-blue-deep text-blue-deep rounded-xl px-6 py-3 font-semibold hover:bg-blue-deep/5 transition-colors duration-200"
              >
                Start a Pilot
              </a>
            </motion.div>

            {/* School — Popular */}
            <motion.div
              {...fadeUp(0.1)}
              className="bg-white rounded-3xl p-8 shadow-soft-lg border-2 border-blue-primary relative"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-primary text-space-deep text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                  Most Popular
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold text-text-dark">School</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-text-dark">$19</span>
                <span className="text-text-dark/50 mb-2">/ learner / year</span>
              </div>
              <p className="text-text-dark/50 mt-1 text-sm">$1,000 annual minimum</p>
              <ul className="mt-8 space-y-3">
                {[
                  "Unlimited learners",
                  "Full AI ecosystem",
                  "Guide dashboards",
                  "Parent visibility",
                  "Priority support",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-text-dark/70">
                    <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#demo-form"
                className="mt-8 block text-center bg-blue-deep text-white rounded-xl px-6 py-3 font-semibold hover:bg-blue-deep/90 transition-colors duration-200"
              >
                Request a Demo
              </a>
            </motion.div>

            {/* Guide */}
            <motion.div
              {...fadeUp(0.2)}
              className="bg-white rounded-3xl p-8 shadow-soft-md border border-border"
            >
              <h3 className="font-display text-2xl font-bold text-text-dark">Guide</h3>
              <div className="mt-4 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-text-dark">$29</span>
                <span className="text-text-dark/50 mb-2">/ month</span>
              </div>
              <p className="text-text-dark/50 mt-1 text-sm">Per adult creator</p>
              <ul className="mt-8 space-y-3">
                {[
                  "Custom module building",
                  "Learner dashboard",
                  "Parent/share links",
                  "Community access",
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-text-dark/70">
                    <Check className="w-4 h-4 text-emerald flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#demo-form"
                className="mt-8 block text-center border-2 border-blue-deep text-blue-deep rounded-xl px-6 py-3 font-semibold hover:bg-blue-deep/5 transition-colors duration-200"
              >
                Get Started
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            Why Us
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_US.map((item, i) => (
              <motion.div
                key={item.title}
                {...fadeUp(i * 0.1)}
                className="text-center"
              >
                <h3 className="font-display text-2xl font-bold text-text-dark mb-3">
                  {item.title}
                </h3>
                <p className="text-text-dark/60 leading-relaxed text-lg">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Request Form */}
      <section id="demo-form" className="bg-cream-dark py-24 md:py-32">
        <div className="max-w-2xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4"
          >
            Ready to bring Diagonally to your school?
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 text-center mb-12 text-lg"
          >
            Fill out the form below and we&rsquo;ll be in touch within one business day.
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
              <p className="text-2xl font-display font-bold text-text-dark mb-2">Thank you!</p>
              <p className="text-text-dark/60">We&rsquo;ll be in touch within one business day.</p>
            </motion.div>
          ) : (
          <motion.form
            key="form"
            {...fadeUp(0.2)}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="school-name" className="block text-sm font-medium text-text-dark mb-2">
                  School Name
                </label>
                <input
                  id="school-name"
                  type="text"
                  value={formState.schoolName}
                  onChange={(e) => setFormState((s) => ({ ...s, schoolName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                  placeholder="Lincoln Academy"
                />
              </div>
              <div>
                <label htmlFor="school-your-name" className="block text-sm font-medium text-text-dark mb-2">
                  Your Name
                </label>
                <input
                  id="school-your-name"
                  type="text"
                  value={formState.yourName}
                  onChange={(e) => setFormState((s) => ({ ...s, yourName: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="school-role" className="block text-sm font-medium text-text-dark mb-2">
                  Role
                </label>
                <select
                  id="school-role"
                  value={formState.role}
                  onChange={(e) => setFormState((s) => ({ ...s, role: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                >
                  <option value="">Select role…</option>
                  <option value="principal">Principal</option>
                  <option value="teacher">Teacher</option>
                  <option value="curriculum-director">Curriculum Director</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="school-email" className="block text-sm font-medium text-text-dark mb-2">
                  Email
                </label>
                <input
                  id="school-email"
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState((s) => ({ ...s, email: e.target.value }))}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                  placeholder="jane@school.edu"
                />
              </div>
            </div>

            <div>
              <label htmlFor="school-num-students" className="block text-sm font-medium text-text-dark mb-2">
                Number of Students
              </label>
              <input
                id="school-num-students"
                type="number"
                value={formState.numStudents}
                onChange={(e) => setFormState((s) => ({ ...s, numStudents: e.target.value }))}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40"
                placeholder="120"
                min="1"
              />
            </div>

            <div>
              <label htmlFor="school-message" className="block text-sm font-medium text-text-dark mb-2">
                Message
              </label>
              <textarea
                id="school-message"
                value={formState.message}
                onChange={(e) => setFormState((s) => ({ ...s, message: e.target.value }))}
                rows={4}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text-dark placeholder:text-text-dark/30 focus:outline-none focus:ring-2 focus:ring-blue-primary/40 resize-none"
                placeholder="Tell us about your school and what you're looking for…"
              />
            </div>

            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-deep text-white rounded-xl px-8 py-4 font-semibold hover:bg-blue-deep/90 transition-colors duration-200 font-display text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending…" : "Request a Demo"}
            </button>
          </motion.form>
          )}
          </AnimatePresence>
        </div>
      </section>
    </>
  )
}
