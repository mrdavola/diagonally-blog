"use client"

import Hero from "@/components/sections/hero"
import Problem from "@/components/sections/problem"
import HowItWorks from "@/components/sections/how-it-works"
import PilotResults from "@/components/sections/pilot-results"
import Comparison from "@/components/sections/comparison"
import TeamPreview from "@/components/sections/team-preview"
import CTABanner from "@/components/sections/cta-banner"

export default function HomeContent() {
  return (
    <>
      <Hero />
      <Problem />
      <HowItWorks />
      <PilotResults />
      <Comparison />
      <TeamPreview />
      <CTABanner />
    </>
  )
}
