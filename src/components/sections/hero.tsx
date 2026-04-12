"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { Constellation } from "@/components/constellation"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
})

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-space-deep flex flex-col items-center justify-center overflow-hidden">
      <Constellation className="absolute inset-0" />

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          {...fadeUp(0)}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
        >
          Math Games Built By Students,{" "}
          <span className="text-blue-primary">For Students.</span>
        </motion.h1>

        <motion.p
          {...fadeUp(0.15)}
          className="mt-6 text-lg md:text-xl text-text-light/80 max-w-2xl mx-auto leading-relaxed"
        >
          Students don&apos;t take tests. They build games that prove they get it.
        </motion.p>

        <motion.div
          {...fadeUp(0.3)}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="/schools#demo-form"
            className="bg-blue-deep text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-blue-deep/90 transition-colors duration-200"
          >
            Request a Demo
          </a>
          <a
            href="/parents#waitlist"
            className="border-2 border-emerald text-emerald rounded-xl px-8 py-3.5 font-semibold hover:bg-emerald/10 transition-colors duration-200"
          >
            Join the Waitlist
          </a>
        </motion.div>

        <motion.p
          {...fadeUp(0.45)}
          className="mt-8 text-sm text-text-light/50"
        >
          Piloted at Acton Academy · 11 of 11 learners wanted to keep going
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 text-text-light/30" />
        </motion.div>
      </motion.div>
    </section>
  )
}
