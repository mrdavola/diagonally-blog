"use client"

import { motion } from "framer-motion"

interface Quote {
  text: string
  author: string
  role?: string
}

export default function TestimonialsBlock({ props }: { props: Record<string, unknown> }) {
  const quotes = (props.quotes as Quote[]) ?? []
  const heading = (props.heading as string) ?? "What People Are Saying"

  return (
    <section className="bg-white py-24 md:py-32">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {quotes.map((quote, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-cream rounded-3xl p-8 shadow-soft-md"
            >
              <blockquote>
                <p className="font-display text-lg italic text-text-dark leading-relaxed">
                  &ldquo;{quote.text}&rdquo;
                </p>
                <footer className="mt-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-primary to-emerald flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-text-dark text-sm">{quote.author}</p>
                    {quote.role && (
                      <p className="text-text-dark/50 text-xs mt-0.5">{quote.role}</p>
                    )}
                  </div>
                </footer>
              </blockquote>
            </motion.div>
          ))}
        </div>

        {quotes.length === 0 && (
          <p className="text-center text-text-dark/40 text-sm">No testimonials yet.</p>
        )}
      </div>
    </section>
  )
}
