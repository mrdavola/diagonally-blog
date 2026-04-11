"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

export default function FAQAccordionBlock({ props }: { props: Record<string, unknown> }) {
  const items = (props.items as FAQItem[]) ?? []
  const heading = (props.heading as string) ?? "Frequently Asked Questions"
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-6">
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

        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="bg-white rounded-2xl shadow-soft-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                aria-expanded={openIndex === i}
              >
                <span className="font-display font-semibold text-text-dark pr-4">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-dark/40 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div
                    key="content"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-text-dark/70 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {items.length === 0 && (
          <p className="text-center text-text-dark/40 text-sm">No FAQ items yet.</p>
        )}
      </div>
    </section>
  )
}
