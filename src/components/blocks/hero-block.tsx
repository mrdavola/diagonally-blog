"use client"

import { motion } from "framer-motion"
import { Constellation } from "@/components/constellation"

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
})

export default function HeroBlock({ props }: { props: Record<string, unknown> }) {
  const headline = (props.headline as string) ?? "Your Headline Here"
  const subheadline = (props.subheadline as string) ?? ""
  const cta1Text = (props.cta1Text as string) ?? "Get Started"
  const cta1Href = (props.cta1Href as string) ?? "#"
  const cta2Text = (props.cta2Text as string) ?? ""
  const cta2Href = (props.cta2Href as string) ?? "#"
  const showConstellation = props.showConstellation !== false

  return (
    <section className="relative min-h-screen bg-space-deep flex flex-col items-center justify-center overflow-hidden">
      {showConstellation && <Constellation className="absolute inset-0" />}

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.h1
          {...fadeUp(0)}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
        >
          {headline}
        </motion.h1>

        {subheadline && (
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-light/80 max-w-2xl mx-auto leading-relaxed"
          >
            {subheadline}
          </motion.p>
        )}

        {(cta1Text || cta2Text) && (
          <motion.div
            {...fadeUp(0.3)}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
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
          </motion.div>
        )}
      </div>
    </section>
  )
}
