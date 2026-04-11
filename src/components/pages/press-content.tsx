"use client"

import { motion } from "framer-motion"
import { Download } from "lucide-react"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const KEY_FACTS = [
  { label: "Founded", value: "2026" },
  { label: "Team", value: "3 co-founders" },
  { label: "Pilot", value: "11 learners, 100% retention" },
  { label: "Standards", value: "480 Common Core math" },
  { label: "License", value: "Apache 2.0 (open source core)" },
  { label: "Tech", value: "Next.js, Firebase, AI-powered" },
]

const BRAND_ASSETS = [
  { name: "Logo Pack", desc: "SVG, PNG in light and dark variants" },
  { name: "Product Screenshots", desc: "Galaxy map, game builder, and peer review" },
  { name: "Team Headshots", desc: "High-res photos of all three co-founders" },
]

export default function PressContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Press &amp; Media
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Resources for journalists and media covering Diagonally.
          </motion.p>
        </div>
      </section>

      {/* Boilerplate + Key Facts */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Boilerplate */}
            <motion.div
              {...fadeUp(0)}
              className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-soft-sm"
            >
              <h2 className="font-display text-2xl font-bold text-text-dark mb-6">
                About Diagonally
              </h2>
              <p className="text-lg leading-relaxed text-text-dark/80">
                Diagonally is an AI-powered math learning platform where K-12 students build games
                instead of taking tests. Founded by educators with 30+ years of experience across
                education and technology, Diagonally was born from a simple belief: kids learn better
                when they own the process. The platform features a 3D galaxy visualization of 480
                Common Core math standards, an AI-powered game builder, and a peer-review mastery
                system. Piloted at Acton Academy Falls Church with 11 learners in March 2026.
              </p>
            </motion.div>

            {/* Key Facts */}
            <motion.div
              {...fadeUp(0.15)}
              className="bg-cream-dark rounded-3xl p-8"
            >
              <h2 className="font-display text-xl font-bold text-text-dark mb-6">Key Facts</h2>
              <dl className="space-y-4">
                {KEY_FACTS.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">
                      {fact.label}
                    </dt>
                    <dd className="text-text-dark font-medium mt-0.5">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Brand Assets */}
      <section className="bg-cream py-24">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl font-bold text-text-dark mb-4"
          >
            Brand Assets
          </motion.h2>
          <motion.p
            {...fadeUp(0.1)}
            className="text-text-dark/60 mb-10"
          >
            Download official Diagonally brand materials for editorial use.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BRAND_ASSETS.map((asset, i) => (
              <motion.div
                key={asset.name}
                {...fadeUp(i * 0.1)}
                className="bg-white rounded-2xl p-6 shadow-soft-sm flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-blue-primary" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-text-dark">{asset.name}</h3>
                  <p className="text-sm text-text-dark/60 mt-1">{asset.desc}</p>
                  <button className="mt-3 text-sm font-semibold text-blue-deep hover:underline cursor-pointer">
                    Download
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Press Contact */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            {...fadeUp(0)}
            className="bg-white rounded-3xl p-8 shadow-soft-sm max-w-2xl"
          >
            <h2 className="font-display text-2xl font-bold text-text-dark mb-4">
              Press Inquiries
            </h2>
            <p className="text-text-dark/70 leading-relaxed">
              For press inquiries, interview requests, or media coverage, please reach out directly.
            </p>
            <a
              href="mailto:press@diagonally.org"
              className="inline-block mt-6 bg-blue-deep text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
            >
              press@diagonally.org
            </a>
          </motion.div>
        </div>
      </section>
    </>
  )
}
