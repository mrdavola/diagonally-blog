"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { TEAM } from "@/lib/constants"

function getMemberPhoto(name: string): string | null {
  const lower = name.toLowerCase()
  if (lower.includes("mike")) return "/images/team/mike.jpg"
  if (lower.includes("scott")) return "/images/team/scott.jpg"
  if (lower.includes("barbara")) return "/images/team/barbara.jpg"
  return null
}

export default function TeamPreview() {
  return (
    <section className="bg-cream-dark py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
        >
          30+ Years in Education and Tech
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="bg-white rounded-3xl p-8 shadow-soft-md text-center hover:shadow-soft-lg transition-shadow duration-300"
            >
              {/* Team photo */}
              {getMemberPhoto(member.name) ? (
                <Image
                  src={getMemberPhoto(member.name)!}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full object-cover mx-auto"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mx-auto">
                  <span className="font-display text-2xl font-bold text-text-dark/40">{member.name[0]}</span>
                </div>
              )}

              <h3 className="font-display text-xl font-bold text-text-dark mt-4">
                {member.name}
              </h3>
              <p className="text-blue-primary text-sm font-medium mt-1">
                {member.role}
              </p>
              <p className="text-text-dark/70 text-sm mt-3 leading-relaxed">
                {member.bio}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
