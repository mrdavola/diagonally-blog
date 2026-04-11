"use client"

import { motion } from "framer-motion"
import { TEAM } from "@/lib/constants"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

const TIMELINE = [
  { date: "March 7, 2026", description: "Wayfinder prototype 1.0 launched" },
  { date: "March 11", description: "Wayfinder prototype 2.0 launched" },
  { date: "March 17", description: "Option-C 1.0 launched" },
  { date: "March 26", description: "First pilot with 11 Acton Academy learners" },
  { date: "April 2026", description: "Galaxy-style 3D math concept map goes live" },
]

export default function AboutContent() {
  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Our Story
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Founded by educators who saw their own kids&rsquo; curiosity fade — and decided to do something about it.
          </motion.p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="bg-white py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              {...fadeUp(0)}
              className="space-y-6 font-body text-lg leading-relaxed text-text-dark/80"
            >
              <p>
                Barbara spent years as a physician and WHO technical officer, working across 25+ countries to improve health systems. But when she watched her own children lose their spark for learning inside traditional schools, she knew something had to change.
              </p>
              <p>
                She founded an Acton Academy — a learner-driven microschool built on the belief that kids are already curious, capable, and motivated. The job of education is to get out of the way and give them the right tools.
              </p>
              <p>
                What she saw in the classroom was clear: children didn&rsquo;t need more content. They needed ownership. They needed to build things, to create, to make learning feel like theirs. When students built games to prove they understood a math concept, something clicked that no worksheet ever could.
              </p>
              <p>
                Mike had been running hackathons and practicethons for students across Hong Kong and Southeast Asia — watching kids light up the moment they stopped consuming and started making. He and Barbara crossed paths at the intersection of education and technology, and Diagonally was born.
              </p>
              <p>
                Scott brought the curriculum architecture and the storytelling — 12 years building Critical Thinking programs across Asia, a 20,000-person audience built from scratch. Together, they set out to build the platform that gives every learner ownership, relevance, and community.
              </p>
            </motion.div>

            {/* Image placeholder */}
            <motion.div
              {...fadeUp(0.2)}
              className="rounded-3xl bg-space-mid/10 aspect-[4/3] flex items-center justify-center"
            >
              <span className="text-text-dark/30 text-sm font-medium">Team Photo</span>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            Meet the Team
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TEAM.map((member, i) => (
              <motion.div
                key={member.name}
                {...fadeUp(i * 0.12)}
                className="bg-white rounded-3xl p-8 shadow-soft-md text-center hover:shadow-soft-lg transition-shadow duration-300"
              >
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-primary to-emerald mx-auto" />
                <h3 className="font-display text-2xl font-bold text-text-dark mt-6">
                  {member.name}
                </h3>
                <p className="text-blue-primary font-medium mt-1">
                  {member.role}
                </p>
                <p className="text-text-dark/70 leading-relaxed mt-4">
                  {member.bio}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="bg-space-deep text-white py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold"
          >
            Our Mission
          </motion.h2>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-8 text-2xl md:text-3xl italic font-display text-blue-primary/90 leading-relaxed"
          >
            &ldquo;Give learners ownership, relevance, and community. Because education is life.&rdquo;
          </motion.p>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-cream py-24 md:py-32">
        <div className="max-w-3xl mx-auto px-6">
          <motion.h2
            {...fadeUp(0)}
            className="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16"
          >
            Our Journey
          </motion.h2>

          <div className="relative pl-8">
            {/* Vertical line */}
            <div className="absolute left-0 top-2 bottom-2 border-l-2 border-blue-primary/20" />

            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.1)}
                  className="relative"
                >
                  {/* Dot */}
                  <div className="absolute -left-[2.3rem] top-1 w-4 h-4 rounded-full bg-blue-primary" />
                  <p className="font-display text-sm font-semibold text-blue-primary">
                    {item.date}
                  </p>
                  <p className="mt-1 text-text-dark leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
