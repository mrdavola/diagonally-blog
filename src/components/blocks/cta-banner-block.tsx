"use client"

import { motion } from "framer-motion"
import { Constellation } from "@/components/constellation"

export default function CTABannerBlock({ props }: { props: Record<string, unknown> }) {
  const headline = (props.headline as string) ?? "Ready to get started?"
  const subheadline = (props.subheadline as string) ?? ""
  const cta1Text = (props.cta1Text as string) ?? "Request a Demo"
  const cta1Href = (props.cta1Href as string) ?? "#"
  const cta2Text = (props.cta2Text as string) ?? ""
  const cta2Href = (props.cta2Href as string) ?? "#"
  const showConstellation = props.showConstellation !== false

  return (
    <section className="relative bg-space-deep overflow-hidden">
      {showConstellation && <Constellation className="absolute inset-0" />}

      <div className="relative z-10 py-24 md:py-32 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
            {headline}
          </h2>

          {subheadline && (
            <p className="mt-4 text-text-light/80 max-w-2xl mx-auto leading-relaxed">
              {subheadline}
            </p>
          )}

          {(cta1Text || cta2Text) && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              {cta1Text && (
                <a
                  href={cta1Href}
                  className="bg-blue-deep text-white rounded-xl px-8 py-3.5 font-semibold hover:bg-blue-deep/90 transition-colors duration-200"
                >
                  {cta1Text}
                </a>
              )}
              {cta2Text && (
                <a
                  href={cta2Href}
                  className="border-2 border-emerald text-emerald rounded-xl px-8 py-3.5 font-semibold hover:bg-emerald/10 transition-colors duration-200"
                >
                  {cta2Text}
                </a>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
