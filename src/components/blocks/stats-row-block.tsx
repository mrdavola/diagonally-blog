"use client"

import { motion } from "framer-motion"

interface Stat {
  value: string
  label: string
}

export default function StatsRowBlock({ props }: { props: Record<string, unknown> }) {
  const stats = (props.stats as Stat[]) ?? []
  const heading = (props.heading as string) ?? ""

  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {heading && (
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            {heading}
          </motion.h2>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-3xl p-8 shadow-soft-md text-center"
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
      </div>
    </section>
  )
}
