import { NextResponse } from "next/server"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

const SEED_POSTS = [
  {
    slug: "why-we-build-in-public",
    title: "Why We Build Diagonally in Public — and What We've Learned So Far",
    excerpt:
      "From prototype to pilot in 30 days. We share everything: our wins, our failures, and the unexpected lessons from watching 11 kids build math games.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
    coverImage: "",
    draftContent: [
      {
        id: "p1",
        type: "paragraph",
        content:
          "When we decided to build Diagonally in public, we didn't have a roadmap — just a belief that transparency builds trust faster than marketing ever could.",
      },
      {
        id: "p2",
        type: "heading",
        content: "Why Public?",
      },
      {
        id: "p3",
        type: "paragraph",
        content:
          "Education is full of products built in isolation, launched with fanfare, and abandoned when they don't fit real classrooms. We wanted to do the opposite. Every decision, every pivot, every failed experiment — we share it all.",
      },
      {
        id: "p4",
        type: "quote",
        content:
          "The best way to build something people actually want is to build it with them watching.",
      },
      {
        id: "p5",
        type: "paragraph",
        content:
          "In our first 30 days, we shipped two prototypes (Wayfinder 1.0 and 2.0), launched Option-C, ran a pilot with 11 Acton Academy learners, and built a 3D galaxy visualization of 480 math standards. All of it documented, all of it open.",
      },
    ],
    publishedContent: [
      {
        id: "p1",
        type: "paragraph",
        content:
          "When we decided to build Diagonally in public, we didn't have a roadmap — just a belief that transparency builds trust faster than marketing ever could.",
      },
      {
        id: "p2",
        type: "heading",
        content: "Why Public?",
      },
      {
        id: "p3",
        type: "paragraph",
        content:
          "Education is full of products built in isolation, launched with fanfare, and abandoned when they don't fit real classrooms. We wanted to do the opposite. Every decision, every pivot, every failed experiment — we share it all.",
      },
      {
        id: "p4",
        type: "quote",
        content:
          "The best way to build something people actually want is to build it with them watching.",
      },
      {
        id: "p5",
        type: "paragraph",
        content:
          "In our first 30 days, we shipped two prototypes (Wayfinder 1.0 and 2.0), launched Option-C, ran a pilot with 11 Acton Academy learners, and built a 3D galaxy visualization of 480 math standards. All of it documented, all of it open.",
      },
    ],
    status: "published",
  },
  {
    slug: "11-learners-one-challenge",
    title: "11 Learners, One Challenge: What Happened When We Let Students Choose",
    excerpt:
      "We gave learners one rule: pick a math concept and build a game. What happened next surprised everyone in the room.",
    category: "Learner Stories",
    authorId: "Barbara Jauregui Wurst",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "On March 26, 2026, we walked into Acton Academy Falls Church with a simple challenge: pick a math concept and design a game around it." },
      { id: "p2", type: "paragraph", content: "Zero prompts needed. The learners gravitated naturally toward brainstorming in groups, used math in unexpected and creative ways, and incorporated environments and topics they actually cared about." },
      { id: "p3", type: "quote", content: "Two groups even took out Monopoly to see where they could see math in it." },
      { id: "p4", type: "paragraph", content: "All 11 learners wanted to keep building after spring break. That's the signal we were looking for." },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "On March 26, 2026, we walked into Acton Academy Falls Church with a simple challenge: pick a math concept and design a game around it." },
      { id: "p2", type: "paragraph", content: "Zero prompts needed. The learners gravitated naturally toward brainstorming in groups, used math in unexpected and creative ways, and incorporated environments and topics they actually cared about." },
      { id: "p3", type: "quote", content: "Two groups even took out Monopoly to see where they could see math in it." },
      { id: "p4", type: "paragraph", content: "All 11 learners wanted to keep building after spring break. That's the signal we were looking for." },
    ],
    status: "published",
  },
  {
    slug: "480-standards-one-galaxy",
    title: "480 Standards, One Galaxy: Building the Math Concept Map",
    excerpt:
      "How we visualized every Common Core math standard as a navigable 3D star map — and why spatial metaphors matter for learner agency.",
    category: "Product Updates",
    authorId: "Mike Davola",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "When we started mapping the Common Core math standards, we had 480 individual skills to organize. Spreadsheets weren't going to cut it." },
      { id: "p2", type: "paragraph", content: "We built a 3D galaxy where each planet is a math topic and each moon is a specific skill. Students navigate through space, clicking on planets to explore what they can learn and build." },
      { id: "p3", type: "quote", content: "Now you've got the visuals right. — An Acton Academy learner, seeing the galaxy for the first time" },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "When we started mapping the Common Core math standards, we had 480 individual skills to organize. Spreadsheets weren't going to cut it." },
      { id: "p2", type: "paragraph", content: "We built a 3D galaxy where each planet is a math topic and each moon is a specific skill. Students navigate through space, clicking on planets to explore what they can learn and build." },
      { id: "p3", type: "quote", content: "Now you've got the visuals right. — An Acton Academy learner, seeing the galaxy for the first time" },
    ],
    status: "published",
  },
  {
    slug: "project-based-learning-research",
    title: "The Research Behind Project-Based Learning in Math",
    excerpt:
      "Decades of studies point in the same direction: students who build, create, and teach learn more deeply. Here's what the evidence says.",
    category: "Education",
    authorId: "Scott R. Nicoll",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "Project-based learning isn't new. But applying it to math — and combining it with AI — is. Here's what the research says about why this approach works." },
      { id: "p2", type: "paragraph", content: "Large systematic reviews across age ranges consistently show that PBL produces better outcomes than traditional instruction, especially for conceptual understanding and transfer." },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "Project-based learning isn't new. But applying it to math — and combining it with AI — is. Here's what the research says about why this approach works." },
      { id: "p2", type: "paragraph", content: "Large systematic reviews across age ranges consistently show that PBL produces better outcomes than traditional instruction, especially for conceptual understanding and transfer." },
    ],
    status: "published",
  },
  {
    slug: "ai-game-builder-v1",
    title: "Shipping the AI Game Builder: What We Got Right and Wrong",
    excerpt:
      "Version 1 of our AI game builder launched on March 17th. Here's an honest post-mortem on what worked, what broke, and what we'd do differently.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "On March 17, we shipped Option-C 1.0 — our AI-powered game builder. Students chat with an AI 'Genie' to design a game concept, then the AI generates a playable HTML5 game." },
      { id: "p2", type: "paragraph", content: "What worked: the chat-based design flow felt natural. Students loved explaining their game ideas. What broke: some generated games had bugs that were hard for students to debug." },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "On March 17, we shipped Option-C 1.0 — our AI-powered game builder. Students chat with an AI 'Genie' to design a game concept, then the AI generates a playable HTML5 game." },
      { id: "p2", type: "paragraph", content: "What worked: the chat-based design flow felt natural. Students loved explaining their game ideas. What broke: some generated games had bugs that were hard for students to debug." },
    ],
    status: "published",
  },
  {
    slug: "ownership-moment",
    title: "The Ownership Moment: When a Learner Debugs Their Own Game",
    excerpt:
      "One learner iterated six times with the AI to fix her game before running out of time. She didn't ask for help. She just kept going.",
    category: "Learner Stories",
    authorId: "Scott R. Nicoll",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "During our pilot, one learner discovered she could tell the AI to fix her game. She iterated six times, tweaking and testing, before time ran out." },
      { id: "p2", type: "paragraph", content: "She didn't ask for help. She didn't get frustrated. She just kept going. That's the ownership moment we're building for." },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "During our pilot, one learner discovered she could tell the AI to fix her game. She iterated six times, tweaking and testing, before time ran out." },
      { id: "p2", type: "paragraph", content: "She didn't ask for help. She didn't get frustrated. She just kept going. That's the ownership moment we're building for." },
    ],
    status: "published",
  },
  {
    slug: "wayfinder-prototype",
    title: "Wayfinder 1.0: Our First Prototype and What We Learned",
    excerpt:
      "The very first version of Diagonally was called Wayfinder. It launched on March 7th. Here's everything we shipped and everything we scrapped.",
    category: "Build-in-Public",
    authorId: "Mike Davola",
    coverImage: "",
    draftContent: [
      { id: "p1", type: "paragraph", content: "Before Diagonally had a name, it was Wayfinder — a prototype that launched on March 7, 2026. Four days later, we shipped v2. Then we scrapped the whole approach and built something new." },
      { id: "p2", type: "paragraph", content: "That's the beauty of building fast: you learn what doesn't work before you get attached to it." },
    ],
    publishedContent: [
      { id: "p1", type: "paragraph", content: "Before Diagonally had a name, it was Wayfinder — a prototype that launched on March 7, 2026. Four days later, we shipped v2. Then we scrapped the whole approach and built something new." },
      { id: "p2", type: "paragraph", content: "That's the beauty of building fast: you learn what doesn't work before you get attached to it." },
    ],
    status: "published",
  },
]

export async function POST() {
  try {
    for (const post of SEED_POSTS) {
      const ref = doc(db, "posts", post.slug)
      await setDoc(ref, {
        ...post,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    return NextResponse.json({ success: true, count: SEED_POSTS.length })
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
