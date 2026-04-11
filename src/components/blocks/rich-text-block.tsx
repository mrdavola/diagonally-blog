"use client"

import { motion } from "framer-motion"

export default function RichTextBlock({ props }: { props: Record<string, unknown> }) {
  const content = (props.content as string) ?? ""

  const paragraphs = content.split(/\n\n+/).filter(Boolean)

  return (
    <section className="bg-cream py-16 md:py-24">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto px-6"
      >
        {paragraphs.length > 0 ? (
          paragraphs.map((para, i) => (
            <p
              key={i}
              className="text-base md:text-lg text-text-dark/80 leading-relaxed mb-6 last:mb-0"
            >
              {para}
            </p>
          ))
        ) : (
          <p className="text-base md:text-lg text-text-dark/80 leading-relaxed">{content}</p>
        )}
      </motion.div>
    </section>
  )
}
