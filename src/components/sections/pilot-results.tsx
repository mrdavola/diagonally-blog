"use client"

import { motion } from "framer-motion"
import { PILOT_STATS } from "@/lib/constants"

export default function PilotResults() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-l-4 border-gold pl-8 md:pl-12">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark"
          >
            11 learners. Zero prompts. 100% wanted more.
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-12">
            {PILOT_STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className="font-display text-4xl md:text-5xl font-bold text-gold">
                  {stat.value}
                </div>
                <div className="text-sm text-text-dark/60 mt-2 leading-snug">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.blockquote
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 border-l-4 border-gold pl-6"
          >
            <p className="font-display text-2xl md:text-3xl italic text-text-dark">
              &ldquo;Now you&apos;ve got the visuals right.&rdquo;
            </p>
            <footer className="mt-3 text-sm text-text-dark/50">
              — Acton Academy Learner
            </footer>
          </motion.blockquote>
        </div>
      </div>
    </section>
  )
}
