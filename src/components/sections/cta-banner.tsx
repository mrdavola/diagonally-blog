"use client"

import { motion } from "framer-motion"
import { Constellation } from "@/components/constellation"

export default function CTABanner() {
  return (
    <section className="relative bg-space-deep overflow-hidden">
      <Constellation className="absolute inset-0" />

      <div className="relative z-10 py-24 md:py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
            Ready to think diagonally?
          </h2>
          <p className="mt-4 text-text-light/80 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re a school, a homeschool co-op, or a parent — we&apos;d love to show
            you what your students can build.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="bg-blue-deep text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-blue-deep/90 transition-colors duration-200"
            >
              Request a Demo
            </a>
            <a
              href="#waitlist"
              className="border-2 border-emerald text-emerald rounded-xl px-8 py-3.5 font-semibold hover:bg-emerald/10 transition-colors duration-200"
            >
              Join the Waitlist
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
