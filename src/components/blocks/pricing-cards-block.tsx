"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

interface PricingTier {
  name: string
  price: string
  period?: string
  features: string[]
  ctaText?: string
  ctaHref?: string
  highlighted?: boolean
}

export default function PricingCardsBlock({ props }: { props: Record<string, unknown> }) {
  const tiers = (props.tiers as PricingTier[]) ?? []
  const heading = (props.heading as string) ?? "Pricing"
  const subheading = (props.subheading as string) ?? ""

  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        {heading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-dark">
              {heading}
            </h2>
            {subheading && (
              <p className="mt-4 text-text-dark/60 max-w-xl mx-auto leading-relaxed">
                {subheading}
              </p>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`rounded-3xl p-8 ${
                tier.highlighted
                  ? "bg-space-deep text-white shadow-soft-lg border-2 border-blue-primary"
                  : "bg-white shadow-soft-md border border-text-dark/8"
              }`}
            >
              <h3
                className={`font-display text-xl font-bold ${
                  tier.highlighted ? "text-white" : "text-text-dark"
                }`}
              >
                {tier.name}
              </h3>

              <div className="mt-4 flex items-end gap-1">
                <span
                  className={`font-display text-4xl font-bold ${
                    tier.highlighted ? "text-white" : "text-text-dark"
                  }`}
                >
                  {tier.price}
                </span>
                {tier.period && (
                  <span
                    className={`text-sm mb-1 ${
                      tier.highlighted ? "text-white/60" : "text-text-dark/50"
                    }`}
                  >
                    /{tier.period}
                  </span>
                )}
              </div>

              <ul className="mt-8 space-y-3">
                {tier.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        tier.highlighted ? "text-emerald" : "text-emerald"
                      }`}
                    />
                    <span
                      className={`text-sm leading-relaxed ${
                        tier.highlighted ? "text-white/80" : "text-text-dark/70"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {tier.ctaText && (
                <a
                  href={tier.ctaHref ?? "#"}
                  className={`mt-8 block text-center rounded-xl px-6 py-3.5 font-semibold transition-colors duration-200 ${
                    tier.highlighted
                      ? "bg-blue-deep text-white hover:bg-blue-deep/90"
                      : "border-2 border-blue-primary text-blue-primary hover:bg-blue-primary/5"
                  }`}
                >
                  {tier.ctaText}
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {tiers.length === 0 && (
          <p className="text-center text-text-dark/40 text-sm">No pricing tiers defined.</p>
        )}
      </div>
    </section>
  )
}
