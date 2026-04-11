"use client"

import { motion } from "framer-motion"
import { FileX, Bot, Unplug } from "lucide-react"
import { WaveDivider } from "@/components/wave-divider"

const cards = [
  {
    icon: FileX,
    title: "Worksheets don't prove understanding",
    description: "Students memorize procedures but can't explain why they work.",
  },
  {
    icon: Bot,
    title: "AI chatbots are glorified textbooks",
    description: "The same tired curriculum fed through a chat interface. Linear thinking in a new wrapper.",
  },
  {
    icon: Unplug,
    title: "Skills without application",
    description: "Students get taught skills but never how to use them in the real world.",
  },
]

export default function Problem() {
  return (
    <>
      <WaveDivider topColor="#080c18" bottomColor="#faf7f2" />
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-text-dark">
              The moment learning feels like school, students check out.
            </h2>
            <p className="mt-4 text-text-dark/60 text-lg">
              Current alternatives are just traditional education in a new wrapper.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {cards.map((card, i) => {
              const Icon = card.icon
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="bg-white rounded-3xl p-8 shadow-soft-md"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-primary/10 flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5 text-blue-primary" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-text-dark mb-3">
                    {card.title}
                  </h3>
                  <p className="text-text-dark/60 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>
    </>
  )
}
