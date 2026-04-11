"use client"

import { motion } from "framer-motion"

const steps = [
  {
    number: "01",
    title: "Explore",
    description: "Navigate a galaxy of math concepts. Each planet is a topic. Each moon is a skill.",
    placeholder: "Galaxy View",
  },
  {
    number: "02",
    title: "Build",
    description: "Design and build your own math games with an AI guide.",
    placeholder: "Game Builder",
  },
  {
    number: "03",
    title: "Master",
    description: "Prove mastery by playing games your peers built.",
    placeholder: "Mastery Progress",
  },
]

export default function HowItWorks() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text-dark">
            Think Diagonally.
          </h2>
        </motion.div>

        <div className="relative">
          {/* Dotted line connector (desktop only) */}
          <div className="hidden md:block absolute top-6 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] border-t-2 border-dashed border-blue-primary/30" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="bg-white rounded-3xl p-6 shadow-soft-sm"
              >
                <div className="w-12 h-12 rounded-full bg-blue-primary flex items-center justify-center mb-5">
                  <span className="font-display font-bold text-white text-sm">{step.number}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-text-dark mb-2">
                  {step.title}
                </h3>
                <p className="text-text-dark/60 text-sm leading-relaxed mb-5">
                  {step.description}
                </p>
                {/* Screenshot placeholder */}
                <div className="rounded-2xl bg-space-mid/10 aspect-video flex items-center justify-center">
                  <span className="text-text-dark/30 text-sm font-medium">{step.placeholder}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
