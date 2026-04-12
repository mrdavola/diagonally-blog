"use client"

import { useState } from "react"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useAuth } from "@/components/admin/auth-provider"

const SEED_POSTS = [
  {
    slug: "why-we-build-in-public",
    title: "Why We Build Diagonally in Public — and What We've Learned So Far",
    excerpt: "From prototype to pilot in 30 days. We share everything: our wins, our failures, and the unexpected lessons from watching 11 kids build math games.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
  },
  {
    slug: "11-learners-one-challenge",
    title: "11 Learners, One Challenge: What Happened When We Let Students Choose",
    excerpt: "We gave learners one rule: pick a math concept and build a game. What happened next surprised everyone in the room.",
    category: "Learner Stories",
    authorId: "Barbara Jauregui Wurst",
  },
  {
    slug: "480-standards-one-galaxy",
    title: "480 Standards, One Galaxy: Building the Math Concept Map",
    excerpt: "How we visualized every Common Core math standard as a navigable 3D star map — and why spatial metaphors matter for learner agency.",
    category: "Product Updates",
    authorId: "Mike Davola",
  },
  {
    slug: "project-based-learning-research",
    title: "The Research Behind Project-Based Learning in Math",
    excerpt: "Decades of studies point in the same direction: students who build, create, and teach learn more deeply.",
    category: "Education",
    authorId: "Scott R. Nicoll",
  },
  {
    slug: "ai-game-builder-v1",
    title: "Shipping the AI Game Builder: What We Got Right and Wrong",
    excerpt: "Version 1 of our AI game builder launched on March 17th. Here's an honest post-mortem.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
  },
  {
    slug: "ownership-moment",
    title: "The Ownership Moment: When a Learner Debugs Their Own Game",
    excerpt: "One learner iterated six times with the AI to fix her game before running out of time.",
    category: "Learner Stories",
    authorId: "Scott R. Nicoll",
  },
  {
    slug: "wayfinder-prototype",
    title: "Wayfinder 1.0: Our First Prototype and What We Learned",
    excerpt: "The very first version of Diagonally was called Wayfinder. It launched on March 7th.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
  },
]

export default function SeedPage() {
  const { user } = useAuth()
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle")
  const [message, setMessage] = useState("")

  async function seedPosts() {
    if (!user) return
    setStatus("loading")
    try {
      for (const post of SEED_POSTS) {
        const ref = doc(db, "posts", post.slug)
        await setDoc(ref, {
          ...post,
          coverImage: "",
          draftContent: [
            { id: "p1", type: "paragraph" as const, content: post.excerpt },
          ],
          publishedContent: [
            { id: "p1", type: "paragraph" as const, content: post.excerpt },
          ],
          status: "published",
          publishedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })
      }
      setStatus("done")
      setMessage(`Seeded ${SEED_POSTS.length} posts successfully!`)
    } catch (err) {
      setStatus("error")
      setMessage(String(err))
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-white mb-4">Seed Blog Posts</h1>
      <p className="text-text-light/60 mb-6">
        This will create {SEED_POSTS.length} placeholder blog posts in Firestore so they appear in both the admin Posts panel and the public blog page.
      </p>
      <button
        onClick={seedPosts}
        disabled={status === "loading"}
        className="bg-blue-deep text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-deep/80 disabled:opacity-50 transition"
      >
        {status === "loading" ? "Seeding..." : "Seed Posts"}
      </button>
      {message && (
        <p className={`mt-4 text-sm ${status === "done" ? "text-emerald" : "text-red-400"}`}>
          {message}
        </p>
      )}
    </div>
  )
}
