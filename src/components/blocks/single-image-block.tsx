"use client"

import { motion } from "framer-motion"

export default function SingleImageBlock({ props }: { props: Record<string, unknown> }) {
  const src = (props.src as string) ?? ""
  const alt = (props.alt as string) ?? ""
  const caption = (props.caption as string) ?? ""

  if (!src) {
    return (
      <section className="bg-cream py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-cream-dark rounded-3xl h-64 flex items-center justify-center">
            <p className="text-text-dark/30 text-sm">No image URL provided</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-cream py-16 md:py-24">
      <motion.figure
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto px-6"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="w-full rounded-3xl shadow-soft-md object-cover"
        />
        {caption && (
          <figcaption className="mt-4 text-center text-sm text-text-dark/50">
            {caption}
          </figcaption>
        )}
      </motion.figure>
    </section>
  )
}
