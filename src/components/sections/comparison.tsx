"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { COMPARISON_DATA } from "@/lib/constants"

const features = [
  { key: "ownership" as const, label: "Learner Ownership" },
  { key: "community" as const, label: "Community" },
  { key: "tracking" as const, label: "Progress Tracking" },
  { key: "ai" as const, label: "AI-Powered" },
  { key: "openSource" as const, label: "Open Source" },
]

function FeatureCell({ value }: { value: boolean }) {
  return (
    <>
      {value ? (
        <Check className="w-5 h-5 text-emerald mx-auto" />
      ) : (
        <X className="w-5 h-5 text-text-dark/20 mx-auto" />
      )}
      <span className="sr-only">{value ? "Yes" : "No"}</span>
    </>
  )
}

export default function Comparison() {
  return (
    <section className="bg-white py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
        >
          What Makes Us Different
        </motion.h2>

        {/* Desktop table */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="hidden md:block overflow-hidden rounded-3xl border border-text-dark/8"
        >
          <table className="w-full" aria-label="Feature comparison between math learning tools">
            <thead>
              <tr className="bg-cream-dark">
                <th className="text-left px-6 py-4 font-display font-bold text-text-dark text-sm w-[200px]">
                  Tool
                </th>
                {features.map((f) => (
                  <th key={f.key} className="px-4 py-4 font-medium text-text-dark/60 text-sm text-center">
                    {f.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((tool, i) => (
                <tr
                  key={tool.name}
                  className={
                    tool.highlighted
                      ? "bg-blue-primary/5 border-y-2 border-blue-primary"
                      : i % 2 === 0
                      ? "bg-white"
                      : "bg-cream/60"
                  }
                >
                  <td className="px-6 py-4">
                    <span
                      className={`font-display font-bold text-sm ${
                        tool.highlighted ? "text-blue-primary" : "text-text-dark"
                      }`}
                    >
                      {tool.name}
                    </span>
                    <p className="text-xs text-text-dark/50 mt-0.5 font-normal leading-snug">
                      {tool.description}
                    </p>
                  </td>
                  {features.map((f) => (
                    <td key={f.key} className="px-4 py-4 text-center">
                      <FeatureCell value={tool[f.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile cards */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {COMPARISON_DATA.map((tool, i) => (
            <motion.div
              key={tool.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className={`rounded-3xl p-6 shadow-soft-sm ${
                tool.highlighted
                  ? "bg-blue-primary/5 border-2 border-blue-primary"
                  : "bg-white border border-text-dark/8"
              }`}
            >
              <div className="mb-4">
                <h3
                  className={`font-display font-bold text-lg ${
                    tool.highlighted ? "text-blue-primary" : "text-text-dark"
                  }`}
                >
                  {tool.name}
                </h3>
                <p className="text-xs text-text-dark/50 mt-0.5">{tool.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {features.map((f) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <FeatureCell value={tool[f.key]} />
                    <span className="text-xs text-text-dark/60">{f.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
