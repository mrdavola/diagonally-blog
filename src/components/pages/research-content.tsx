"use client"

import { motion } from "framer-motion"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const SIGNALS = [
  {
    title: "Choice created energy",
    body: "Learners gravitated toward topics they already cared about: sports, aliens, saving a world, and space journeys.",
    border: "border-blue-primary",
  },
  {
    title: "Ownership happened fast",
    body: "One group pulled out Monopoly on their own to look for where math already lives inside a game.",
    border: "border-emerald",
  },
  {
    title: "Iteration was learnable",
    body: "One learner discovered she could tell the AI to fix the game, iterated about six times, and got it working before running out of time.",
    border: "border-gold",
  },
]

const STATS = [
  {
    value: "11/11",
    label: "Participation",
    sub: "All learners took on the challenge",
  },
  {
    value: "0",
    label: "Prompts to Start",
    sub: "Learners self-organized into groups without being asked",
  },
  {
    value: "4",
    label: "Learner Voices",
    sub: "Learners recorded themselves explaining their game ideas",
  },
  {
    value: "6×",
    label: "Iteration Signal",
    sub: "AI iterations completed by one learner on a single game",
  },
  {
    value: "11/11",
    label: "Retention",
    sub: "All learners wanted to keep building after spring break",
  },
]

export default function ResearchContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Research &amp; Results
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Data from our pilot program and the research behind project-based math learning.
          </motion.p>
        </div>
      </section>

      {/* Pilot Methodology */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            {...fadeUp(0)}
            className="bg-white rounded-3xl mx-auto shadow-soft-md p-10 md:p-14 max-w-4xl"
          >
            <p className="text-xs font-semibold tracking-widest text-blue-primary uppercase mb-4">
              Methodology
            </p>
            <h2 className="font-display text-3xl font-bold text-text-dark mb-6">
              March 2026 Pilot
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-text-dark/80">
              <p>
                In late March 2026, we ran our first formal pilot with 11 learners at Acton Academy
                Falls Church — a learner-driven microschool in Northern Virginia. Participants ranged
                in age from 8 to 14 years old.
              </p>
              <p>
                Learners were given a single challenge: pick a math concept you care about and build
                a game around it. No starter templates. No rubric. No teacher-directed prompts to
                begin. The only constraint was time.
              </p>
              <p>
                We observed learner behavior throughout the session, tracking engagement patterns,
                self-organization, collaboration, and iteration behavior. We collected video
                recordings of four learners explaining their game ideas in their own words.
              </p>
              <p>
                The pilot was designed to answer one question: will learners engage meaningfully
                with math when given genuine ownership over the task? The answer was unambiguous.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Three Signals */}
      <section className="bg-cream py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-12"
          >
            Three Signals That Mattered
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {SIGNALS.map((signal, i) => (
              <motion.div
                key={signal.title}
                {...fadeUp(i * 0.12)}
                className={`bg-white rounded-3xl p-8 shadow-soft-sm border-t-4 ${signal.border}`}
              >
                <h3 className="font-display text-xl font-bold text-text-dark mb-4">
                  {signal.title}
                </h3>
                <p className="text-text-dark/70 leading-relaxed">{signal.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Engagement Data */}
      <section className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4"
          >
            Engagement Data
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 text-center text-lg mb-12 max-w-xl mx-auto"
          >
            Raw signals from the March 26, 2026 pilot session.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                {...fadeUp(i * 0.08)}
                className="bg-cream rounded-2xl p-8 shadow-soft-sm"
              >
                <p className="font-display text-4xl font-bold text-blue-deep">{stat.value}</p>
                <p className="font-display text-lg font-semibold text-text-dark mt-2">
                  {stat.label}
                </p>
                <p className="text-sm text-text-dark/60 mt-2 leading-relaxed">{stat.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="bg-cream-dark py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-2xl md:text-3xl font-bold text-text-dark"
          >
            Ongoing Research
          </motion.h2>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg text-text-dark/70 leading-relaxed"
          >
            We&rsquo;re partnering with learning design specialists to measure and publish outcomes
            across a larger cohort. Formal findings will be published here as they become available.
            Stay tuned.
          </motion.p>
        </div>
      </section>
    </>
  )
}
