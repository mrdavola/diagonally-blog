"use client"

import { useState } from "react"
import { doc, setDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
  createSection,
  createBlock,
} from "@/lib/visual-editor/defaults"
import type { Section } from "@/lib/visual-editor/types"

// ─── Home Page ────────────────────────────────────────────────────────────────

function buildHomeSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight text-center">Math Games Built By Students, <span class="text-blue-primary">For Students.</span></h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: '<p class="mt-6 text-lg md:text-xl text-text-light/80 max-w-2xl mx-auto leading-relaxed text-center">Students don\'t take tests. They build games that prove they get it.</p>',
        tag: "p",
      }),
      createBlock("button", {
        label: "Request a Demo",
        href: "/schools#demo-form",
        variant: "primary",
        size: "lg",
      }),
      createBlock("button", {
        label: "Join the Waitlist",
        href: "/parents#waitlist",
        variant: "outline",
        size: "lg",
      }),
      createBlock("text", {
        html: '<p class="mt-8 text-sm text-text-light/50 text-center">Piloted at Acton Academy · 11 of 11 learners wanted to keep going</p>',
        tag: "p",
      }),
    ]),

    // Problem
    createSection("The Problem", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center">The moment learning feels like school, students check out.</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="mt-4 text-text-dark/60 text-lg text-center">Current alternatives are just traditional education in a new wrapper.</p>',
        tag: "p",
      }),
      createBlock("card", {
        title: "Worksheets don't prove understanding",
        body: "Students memorize procedures but can't explain why they work.",
        icon: "FileX",
      }, 4),
      createBlock("card", {
        title: "AI chatbots are glorified textbooks",
        body: "The same tired curriculum fed through a chat interface. Linear thinking in a new wrapper.",
        icon: "Bot",
      }, 4),
      createBlock("card", {
        title: "Skills without application",
        body: "Students get taught skills but never how to use them in the real world.",
        icon: "Unplug",
      }, 4),
    ]),

    // How It Works
    createSection("How It Works", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center">Think Diagonally.</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        number: "01",
        title: "Explore",
        body: "Navigate a galaxy of math concepts. Each planet is a topic. Each moon is a skill.",
      }, 4),
      createBlock("card", {
        number: "02",
        title: "Build",
        body: "Design and build your own math games with an AI guide.",
      }, 4),
      createBlock("card", {
        number: "03",
        title: "Master",
        body: "Prove mastery by playing games your peers built.",
      }, 4),
    ]),

    // Pilot Results
    createSection("Pilot Results", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark">11 learners. Zero prompts. 100% wanted more.</h2>',
        tag: "h2",
      }),
      createBlock("stats-row", {
        stats: [
          { value: "11/11", label: "wanted to keep building after spring break" },
          { value: "0", label: "prompts needed to start collaborating" },
          { value: "4", label: "learners recorded explaining their ideas" },
          { value: "6", label: "AI iterations by one learner before time ran out" },
        ],
      }),
      createBlock("text", {
        html: '<blockquote class="mt-12 font-display text-2xl md:text-3xl italic text-text-dark">"Now you\'ve got the visuals right." <footer class="mt-3 text-sm text-text-dark/50">— Acton Academy Learner</footer></blockquote>',
        tag: "blockquote",
      }),
    ]),

    // Comparison
    createSection("What Makes Us Different", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">What Makes Us Different</h2>',
        tag: "h2",
      }),
      createBlock("comparison-table", {
        features: ["Learner Ownership", "Community", "Progress Tracking", "AI-Powered", "Open Source"],
        rows: [
          { name: "Khanmigo", description: "AI tutor on Khan Academy's linear curriculum", ownership: false, community: false, tracking: true, ai: true, openSource: false },
          { name: "MagicSchool", description: "AI toolkit for teachers", ownership: false, community: false, tracking: false, ai: true, openSource: false },
          { name: "Synthesis", description: "Premium microschool programs", ownership: true, community: true, tracking: true, ai: false, openSource: false },
          { name: "ChatGPT", description: "Open-ended AI", ownership: false, community: false, tracking: false, ai: true, openSource: false },
          { name: "Diagonally", description: "Students build math games with AI", ownership: true, community: true, tracking: true, ai: true, openSource: true, highlighted: true },
        ],
      }),
    ]),

    // Team Preview
    createSection("Team", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">30+ Years in Education and Tech</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        name: "Barbara Jauregui Wurst",
        role: "Education & Field Operations",
        body: "Physician, WHO technical officer across 25+ countries. Founded an Acton Academy. Designs learning experiences and runs pilots. Making sure everything works for real learners in real classrooms.",
        image: "/images/team/barbara.jpg",
      }, 4),
      createBlock("card", {
        name: "Mike Davola",
        role: "Builder & Technology",
        body: "Runs hackathons and practicethons for students. Teaches teachers how to use tech. Builds half-formed ideas into working prototypes on screen while we watch. Ships now. Not later.",
        image: "/images/team/mike.jpg",
      }, 4),
      createBlock("card", {
        name: "Scott R. Nicoll",
        role: "Storytelling & Curriculum",
        body: "12 years developing Critical Thinking curricula across South Korea, China, and Hong Kong. 200+ published articles. 20,000+ audience built from scratch. The storyteller on this dynamic team.",
        image: "/images/team/scott.jpg",
      }, 4),
    ]),

    // CTA Banner
    createSection("CTA Banner", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-5xl font-bold text-white text-center">Ready to think diagonally?</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: "<p class=\"text-text-light/80 max-w-2xl mx-auto leading-relaxed text-center\">Whether you're a school, a homeschool co-op, or a parent — we'd love to show you what your students can build.</p>",
        tag: "p",
      }),
      createBlock("button", {
        label: "Request a Demo",
        href: "/schools#demo-form",
        variant: "primary",
        size: "lg",
      }),
      createBlock("button", {
        label: "Join the Waitlist",
        href: "/parents#waitlist",
        variant: "outline-emerald",
        size: "lg",
      }),
    ]),
  ]
}

// ─── About Page ───────────────────────────────────────────────────────────────

function buildAboutSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-4xl md:text-5xl font-bold text-text-dark text-center">Our Story</h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: "<p class=\"mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed text-center\">Founded by educators who saw their own kids' curiosity fade — and decided to do something about it.</p>",
        tag: "p",
      }),
    ]),

    // Origin Story
    createSection("Origin Story", [
      createBlock("text", {
        html: `<div class="space-y-6 font-body text-lg leading-relaxed text-text-dark/80">
  <p>Barbara spent years as a physician and WHO technical officer, working across 25+ countries to improve health systems. But when she watched her own children lose their spark for learning inside traditional schools, she knew something had to change.</p>
  <p>She founded an Acton Academy — a learner-driven microschool built on the belief that kids are already curious, capable, and motivated. The job of education is to get out of the way and give them the right tools.</p>
  <p>What she saw in the classroom was clear: children didn't need more content. They needed ownership. They needed to build things, to create, to make learning feel like theirs. When students built games to prove they understood a math concept, something clicked that no worksheet ever could.</p>
  <p>Mike had been running hackathons and practicethons for students across Hong Kong and Southeast Asia — watching kids light up the moment they stopped consuming and started making. He and Barbara crossed paths at the intersection of education and technology, and Diagonally was born.</p>
  <p>Scott brought the curriculum architecture and the storytelling — 12 years building Critical Thinking programs across Asia, a 20,000-person audience built from scratch. Together, they set out to build the platform that gives every learner ownership, relevance, and community.</p>
</div>`,
        tag: "div",
      }, 6),
      createBlock("image", {
        src: "",
        alt: "Team Photo",
        placeholder: "Team Photo",
      }, 6),
    ]),

    // Team
    createSection("Meet the Team", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">Meet the Team</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        name: "Barbara Jauregui Wurst",
        role: "Education & Field Operations",
        body: "Physician, WHO technical officer across 25+ countries. Founded an Acton Academy. Designs learning experiences and runs pilots. Making sure everything works for real learners in real classrooms.",
        image: "/images/team/barbara.jpg",
      }, 4),
      createBlock("card", {
        name: "Mike Davola",
        role: "Builder & Technology",
        body: "Runs hackathons and practicethons for students. Teaches teachers how to use tech. Builds half-formed ideas into working prototypes on screen while we watch. Ships now. Not later.",
        image: "/images/team/mike.jpg",
      }, 4),
      createBlock("card", {
        name: "Scott R. Nicoll",
        role: "Storytelling & Curriculum",
        body: "12 years developing Critical Thinking curricula across South Korea, China, and Hong Kong. 200+ published articles. 20,000+ audience built from scratch. The storyteller on this dynamic team.",
        image: "/images/team/scott.jpg",
      }, 4),
    ]),

    // Mission
    createSection("Mission", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-white text-center">Our Mission</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="mt-8 text-2xl md:text-3xl italic font-display text-blue-primary/90 leading-relaxed text-center">"Give learners ownership, relevance, and community. Because education is life."</p>',
        tag: "p",
      }),
    ]),

    // Timeline
    createSection("Our Journey", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">Our Journey</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: `<div class="relative pl-8">
  <div class="absolute left-0 top-2 bottom-2 border-l-2 border-blue-primary/20"></div>
  <div class="space-y-12">
    <div class="relative"><p class="font-display text-sm font-semibold text-blue-primary">March 7, 2026</p><p class="mt-1 text-text-dark leading-relaxed">Wayfinder prototype 1.0 launched</p></div>
    <div class="relative"><p class="font-display text-sm font-semibold text-blue-primary">March 11</p><p class="mt-1 text-text-dark leading-relaxed">Wayfinder prototype 2.0 launched</p></div>
    <div class="relative"><p class="font-display text-sm font-semibold text-blue-primary">March 17</p><p class="mt-1 text-text-dark leading-relaxed">Option-C 1.0 launched</p></div>
    <div class="relative"><p class="font-display text-sm font-semibold text-blue-primary">March 26</p><p class="mt-1 text-text-dark leading-relaxed">First pilot with 11 Acton Academy learners</p></div>
    <div class="relative"><p class="font-display text-sm font-semibold text-blue-primary">April 2026</p><p class="mt-1 text-text-dark leading-relaxed">Galaxy-style 3D math concept map goes live</p></div>
  </div>
</div>`,
        tag: "div",
      }),
    ]),
  ]
}

// ─── Schools Page ─────────────────────────────────────────────────────────────

function buildSchoolsSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-4xl md:text-5xl font-bold text-white text-center">Bring Diagonally to Your Classroom</h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: "<p class=\"mt-6 text-lg md:text-xl text-text-light/80 max-w-2xl mx-auto leading-relaxed text-center\">An AI-powered platform where your students build math games — and prove they understand the concepts.</p>",
        tag: "p",
      }),
      createBlock("button", {
        label: "Request a Demo",
        href: "#demo-form",
        variant: "primary",
        size: "lg",
      }),
    ]),

    // What Your School Gets
    createSection("What Your School Gets", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">What Your School Gets</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        title: "Full AI Ecosystem",
        body: "Access for learners, parents, and guides. Everything they need in one platform.",
        icon: "Sparkles",
      }, 6),
      createBlock("card", {
        title: "High-Touch Onboarding",
        body: "We configure workspaces, cohorts, and starter projects with you.",
        icon: "Users",
      }, 6),
      createBlock("card", {
        title: "Managed Infrastructure",
        body: "Cloud hosting, security, and uptime. You focus on teaching.",
        icon: "Shield",
      }, 6),
      createBlock("card", {
        title: "Continuous Iteration",
        body: "Ongoing support and weekly module updates throughout the year.",
        icon: "RefreshCw",
      }, 6),
    ]),

    // Pricing
    createSection("Pricing", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4">Simple, Transparent Pricing</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="text-text-dark/60 text-center mb-16 text-lg">Pick the plan that fits your school.</p>',
        tag: "p",
      }),
      createBlock("pricing-card", {
        name: "Pilot",
        price: "$250",
        period: "30-day pilot",
        features: ["Up to 25 learners", "Full platform access", "Onboarding sessions", "Feedback sessions included"],
        ctaLabel: "Start a Pilot",
        ctaHref: "#demo-form",
        variant: "default",
      }, 4),
      createBlock("pricing-card", {
        name: "School",
        price: "$19",
        period: "/ learner / year",
        note: "$1,000 annual minimum",
        features: ["Unlimited learners", "Full AI ecosystem", "Guide dashboards", "Parent visibility", "Priority support"],
        ctaLabel: "Request a Demo",
        ctaHref: "#demo-form",
        variant: "featured",
        badge: "Most Popular",
      }, 4),
      createBlock("pricing-card", {
        name: "Guide",
        price: "$29",
        period: "/ month",
        note: "Per adult creator",
        features: ["Custom module building", "Learner dashboard", "Parent/share links", "Community access"],
        ctaLabel: "Get Started",
        ctaHref: "#demo-form",
        variant: "default",
      }, 4),
    ]),

    // Why Us
    createSection("Why Us", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">Why Us</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        title: "Speed",
        body: "We ship new modules weekly.",
      }, 4),
      createBlock("card", {
        title: "Personalization",
        body: "Student profiles and AI feedback become uniquely theirs.",
      }, 4),
      createBlock("card", {
        title: "Data",
        body: "Learner paths accumulate, building smarter feedback at scale.",
      }, 4),
    ]),

    // Demo Form
    createSection("Demo Form", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4">Ready to bring Diagonally to your school?</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: "<p class=\"text-text-dark/60 text-center mb-12 text-lg\">Fill out the form below and we'll be in touch within one business day.</p>",
        tag: "p",
      }),
      createBlock("form", {
        id: "demo-form",
        submitLabel: "Request a Demo",
        submitEndpoint: "/api/contact",
        submitPayloadType: "demo",
        fields: [
          { id: "schoolName", label: "School Name", type: "text", placeholder: "Lincoln Academy", half: true },
          { id: "yourName", label: "Your Name", type: "text", placeholder: "Jane Smith", half: true },
          { id: "role", label: "Role", type: "select", options: ["Principal", "Teacher", "Curriculum Director", "Other"], half: true },
          { id: "email", label: "Email", type: "email", placeholder: "jane@school.edu", half: true },
          { id: "numStudents", label: "Number of Students", type: "number", placeholder: "120" },
          { id: "message", label: "Message", type: "textarea", placeholder: "Tell us about your school and what you're looking for…", rows: 4 },
        ],
      }),
    ]),
  ]
}

// ─── Parents Page ─────────────────────────────────────────────────────────────

function buildParentsSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: "<h1 class=\"font-display text-4xl md:text-5xl font-bold text-text-dark text-center\">Watch Your Child Think Diagonally</h1>",
        tag: "h1",
      }),
      createBlock("text", {
        html: "<p class=\"mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed text-center\">Your child won't just learn math — they'll build games that prove they get it.</p>",
        tag: "p",
      }),
      createBlock("button", {
        label: "Join the Waitlist",
        href: "#waitlist",
        variant: "emerald",
        size: "lg",
      }),
      createBlock("button", {
        label: "See How It Works",
        href: "#how-it-works",
        variant: "outline",
        size: "lg",
      }),
    ]),

    // How It Works
    createSection("How It Works", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">How It Works</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        number: "01",
        title: "Your child picks a math topic",
        body: "They explore a galaxy of concepts and choose one that interests them.",
      }, 4),
      createBlock("card", {
        number: "02",
        title: "They build a game with AI help",
        body: "An AI guide helps them design and create a real, playable game.",
      }, 4),
      createBlock("card", {
        number: "03",
        title: "They master it by playing peers' games",
        body: "Playing games other kids built reinforces the learning.",
      }, 4),
    ]),

    // Track Progress
    createSection("Track Your Child's Progress", [
      createBlock("text", {
        html: "<h2 class=\"font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-6\">Track Your Child's Progress</h2>",
        tag: "h2",
      }),
      createBlock("text", {
        html: "<p class=\"text-text-dark/60 text-center text-lg mb-12 max-w-2xl mx-auto leading-relaxed\">Parents get a dedicated dashboard showing which concepts your child has explored, what games they've built, and where they've proven mastery.</p>",
        tag: "p",
      }),
      createBlock("card", {
        title: "Concepts Explored",
        body: "See every topic your child has visited in the galaxy map.",
      }, 4),
      createBlock("card", {
        title: "Games Built",
        body: "Browse all the games they've created and share them with family.",
      }, 4),
      createBlock("card", {
        title: "Mastery Milestones",
        body: "Track which skills they've proven through peer gameplay.",
      }, 4),
    ]),

    // Waitlist Form
    createSection("Join the Waitlist", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4">Join the Waitlist</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: "<p class=\"text-text-dark/60 text-center mb-12 text-lg leading-relaxed\">We'll let you know when Diagonally is available for families.</p>",
        tag: "p",
      }),
      createBlock("form", {
        id: "waitlist",
        submitLabel: "Join the Waitlist",
        submitEndpoint: "/api/contact",
        submitPayloadType: "waitlist",
        fields: [
          { id: "name", label: "Your Name", type: "text", placeholder: "Alex Johnson" },
          { id: "email", label: "Email", type: "email", placeholder: "alex@email.com" },
          { id: "grade", label: "Child's Grade", type: "select", options: ["Kindergarten", "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "6th Grade", "7th Grade", "8th Grade", "9th Grade", "10th Grade", "11th Grade", "12th Grade"] },
          { id: "source", label: "How did you hear about us?", type: "select", options: ["Social Media", "Friend/Family", "School", "Other"] },
        ],
      }),
    ]),

    // FAQ
    createSection("FAQ", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-16">Frequently Asked Questions</h2>',
        tag: "h2",
      }),
      createBlock("accordion", {
        items: [
          {
            question: "What ages is Diagonally for?",
            answer: "Diagonally covers K-12 math standards, so it works for children from around ages 5 through 18. The AI guide adapts to each learner's level and pace.",
          },
          {
            question: "Is the AI safe for my child?",
            answer: "Yes. The AI guide is specifically designed for educational use, with age-appropriate language, no external browsing, and guardrails that keep conversations focused on learning.",
          },
          {
            question: "How much screen time does it require?",
            answer: "A typical session is 30–60 minutes. Diagonally is designed to be engaging but not addictive — learners build, reflect, and share rather than passively scroll.",
          },
          {
            question: "How is this different from Khan Academy?",
            answer: "Khan Academy uses a linear curriculum where students watch videos and answer questions. Diagonally lets students build games that prove they understand a concept — active creation, not passive consumption. No two learners follow the same path.",
          },
          {
            question: "How much does it cost for families?",
            answer: "We're currently focused on school partnerships. Family pricing is coming soon — join the waitlist to be first to know.",
          },
        ],
      }),
    ]),
  ]
}

// ─── Research Page ────────────────────────────────────────────────────────────

function buildResearchSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-4xl md:text-5xl font-bold text-text-dark text-center">Research &amp; Results</h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: '<p class="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed text-center">Data from our pilot program and the research behind project-based math learning.</p>',
        tag: "p",
      }),
    ]),

    // Methodology
    createSection("Pilot Methodology", [
      createBlock("text", {
        html: `<div class="bg-white rounded-3xl mx-auto shadow-soft-md p-10 md:p-14 max-w-4xl">
  <p class="text-xs font-semibold tracking-widest text-blue-primary uppercase mb-4">Methodology</p>
  <h2 class="font-display text-3xl font-bold text-text-dark mb-6">March 2026 Pilot</h2>
  <div class="space-y-5 text-lg leading-relaxed text-text-dark/80">
    <p>In late March 2026, we ran our first formal pilot with 11 learners at Acton Academy Falls Church — a learner-driven microschool in Northern Virginia. Participants ranged in age from 8 to 14 years old.</p>
    <p>Learners were given a single challenge: pick a math concept you care about and build a game around it. No starter templates. No rubric. No teacher-directed prompts to begin. The only constraint was time.</p>
    <p>We observed learner behavior throughout the session, tracking engagement patterns, self-organization, collaboration, and iteration behavior. We collected video recordings of four learners explaining their game ideas in their own words.</p>
    <p>The pilot was designed to answer one question: will learners engage meaningfully with math when given genuine ownership over the task? The answer was unambiguous.</p>
  </div>
</div>`,
        tag: "div",
      }),
    ]),

    // Three Signals
    createSection("Three Signals That Mattered", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-12">Three Signals That Mattered</h2>',
        tag: "h2",
      }),
      createBlock("card", {
        title: "Choice created energy",
        body: "Learners gravitated toward topics they already cared about: sports, aliens, saving a world, and space journeys.",
        accentColor: "blue",
      }, 4),
      createBlock("card", {
        title: "Ownership happened fast",
        body: "One group pulled out Monopoly on their own to look for where math already lives inside a game.",
        accentColor: "emerald",
      }, 4),
      createBlock("card", {
        title: "Iteration was learnable",
        body: "One learner discovered she could tell the AI to fix the game, iterated about six times, and got it working before running out of time.",
        accentColor: "gold",
      }, 4),
    ]),

    // Engagement Data
    createSection("Engagement Data", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl md:text-4xl font-bold text-text-dark text-center mb-4">Engagement Data</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="text-text-dark/60 text-center text-lg mb-12 max-w-xl mx-auto">Raw signals from the March 26, 2026 pilot session.</p>',
        tag: "p",
      }),
      createBlock("stats-row", {
        stats: [
          { value: "11/11", label: "Participation", sub: "All learners took on the challenge" },
          { value: "0", label: "Prompts to Start", sub: "Learners self-organized into groups without being asked" },
          { value: "4", label: "Learner Voices", sub: "Learners recorded themselves explaining their game ideas" },
          { value: "6×", label: "Iteration Signal", sub: "AI iterations completed by one learner on a single game" },
          { value: "11/11", label: "Retention", sub: "All learners wanted to keep building after spring break" },
        ],
      }),
    ]),

    // Ongoing Research
    createSection("Ongoing Research", [
      createBlock("text", {
        html: '<h2 class="font-display text-2xl md:text-3xl font-bold text-text-dark text-center">Ongoing Research</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: "<p class=\"mt-6 text-lg text-text-dark/70 leading-relaxed text-center\">We're partnering with learning design specialists to measure and publish outcomes across a larger cohort. Formal findings will be published here as they become available. Stay tuned.</p>",
        tag: "p",
      }),
    ]),
  ]
}

// ─── Contact Page ─────────────────────────────────────────────────────────────

function buildContactSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-4xl md:text-5xl font-bold text-text-dark text-center">Get in Touch</h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: "<p class=\"mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed text-center\">Whether you're a school, parent, partner, or journalist — we'd love to hear from you.</p>",
        tag: "p",
      }),
    ]),

    // Contact Form
    createSection("Contact Form", [
      createBlock("form", {
        id: "contact-form",
        title: "Send us a message",
        submitLabel: "Send Message",
        submitEndpoint: "/api/contact",
        fields: [
          { id: "name", label: "Name", type: "text", placeholder: "Your name" },
          { id: "email", label: "Email", type: "email", placeholder: "you@example.com" },
          { id: "inquiryType", label: "Inquiry Type", type: "select", options: ["School / District", "Parent / Family", "Partnership", "Press / Media", "General"] },
          { id: "message", label: "Message", type: "textarea", placeholder: "Tell us what's on your mind...", rows: 4 },
        ],
      }, 7),
      createBlock("text", {
        html: `<div class="flex flex-col gap-4">
  <div class="bg-cream-dark rounded-2xl p-6">
    <h3 class="font-display text-lg font-bold text-text-dark mb-2">Schedule a Call</h3>
    <p class="text-text-dark/70 text-sm leading-relaxed mb-4">Prefer to chat? Book a time that works for you.</p>
    <a href="#" class="inline-block bg-blue-deep text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity">Schedule a Call</a>
  </div>
  <div class="bg-cream-dark rounded-2xl p-6">
    <h3 class="font-display text-lg font-bold text-text-dark mb-4">Quick Links</h3>
    <ul class="space-y-2">
      <li><a href="/schools" class="text-blue-deep font-medium text-sm hover:underline">For Schools</a></li>
      <li><a href="/parents" class="text-blue-deep font-medium text-sm hover:underline">For Parents</a></li>
      <li><a href="/research" class="text-blue-deep font-medium text-sm hover:underline">Research &amp; Results</a></li>
    </ul>
  </div>
  <div class="bg-cream-dark rounded-2xl p-6">
    <h3 class="font-display text-lg font-bold text-text-dark mb-4">Follow Along</h3>
    <ul class="space-y-2">
      <li><a href="https://twitter.com/diagonallyorg" target="_blank" rel="noopener noreferrer" class="text-blue-deep font-medium text-sm hover:underline">Twitter / X</a></li>
      <li><a href="https://linkedin.com/company/diagonally" target="_blank" rel="noopener noreferrer" class="text-blue-deep font-medium text-sm hover:underline">LinkedIn</a></li>
      <li><a href="https://github.com/diagonally" target="_blank" rel="noopener noreferrer" class="text-blue-deep font-medium text-sm hover:underline">GitHub</a></li>
    </ul>
  </div>
</div>`,
        tag: "div",
      }, 5),
    ]),
  ]
}

// ─── Press Page ───────────────────────────────────────────────────────────────

function buildPressSections(): Section[] {
  return [
    // Hero
    createSection("Hero", [
      createBlock("text", {
        html: '<h1 class="font-display text-4xl md:text-5xl font-bold text-text-dark text-center">Press &amp; Media</h1>',
        tag: "h1",
      }),
      createBlock("text", {
        html: '<p class="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed text-center">Resources for journalists and media covering Diagonally.</p>',
        tag: "p",
      }),
    ]),

    // Boilerplate + Key Facts
    createSection("About Diagonally", [
      createBlock("text", {
        html: `<div class="bg-white rounded-3xl p-8 shadow-soft-sm">
  <h2 class="font-display text-2xl font-bold text-text-dark mb-6">About Diagonally</h2>
  <p class="text-lg leading-relaxed text-text-dark/80">Diagonally is an AI-powered math learning platform where K-12 students build games instead of taking tests. Founded by educators with 30+ years of experience across education and technology, Diagonally was born from a simple belief: kids learn better when they own the process. The platform features a 3D galaxy visualization of 480 Common Core math standards, an AI-powered game builder, and a peer-review mastery system. Piloted at Acton Academy Falls Church with 11 learners in March 2026.</p>
</div>`,
        tag: "div",
      }, 8),
      createBlock("text", {
        html: `<div class="bg-cream-dark rounded-3xl p-8">
  <h2 class="font-display text-xl font-bold text-text-dark mb-6">Key Facts</h2>
  <dl class="space-y-4">
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">Founded</dt><dd class="text-text-dark font-medium mt-0.5">2026</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">Team</dt><dd class="text-text-dark font-medium mt-0.5">3 co-founders</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">Pilot</dt><dd class="text-text-dark font-medium mt-0.5">11 learners, 100% retention</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">Standards</dt><dd class="text-text-dark font-medium mt-0.5">480 Common Core math</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">License</dt><dd class="text-text-dark font-medium mt-0.5">Apache 2.0 (open source core)</dd></div>
    <div><dt class="text-xs font-semibold tracking-wide text-text-dark/40 uppercase">Tech</dt><dd class="text-text-dark font-medium mt-0.5">Next.js, Firebase, AI-powered</dd></div>
  </dl>
</div>`,
        tag: "div",
      }, 4),
    ]),

    // Brand Assets
    createSection("Brand Assets", [
      createBlock("text", {
        html: '<h2 class="font-display text-3xl font-bold text-text-dark mb-4">Brand Assets</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="text-text-dark/60 mb-10">Download official Diagonally brand materials for editorial use.</p>',
        tag: "p",
      }),
      createBlock("card", {
        title: "Logo Pack",
        body: "SVG, PNG in light and dark variants",
        icon: "Download",
        actionLabel: "Download",
      }, 4),
      createBlock("card", {
        title: "Product Screenshots",
        body: "Galaxy map, game builder, and peer review",
        icon: "Download",
        actionLabel: "Download",
      }, 4),
      createBlock("card", {
        title: "Team Headshots",
        body: "High-res photos of all three co-founders",
        icon: "Download",
        actionLabel: "Download",
      }, 4),
    ]),

    // Press Contact
    createSection("Press Inquiries", [
      createBlock("text", {
        html: '<h2 class="font-display text-2xl font-bold text-text-dark mb-4">Press Inquiries</h2>',
        tag: "h2",
      }),
      createBlock("text", {
        html: '<p class="text-text-dark/70 leading-relaxed">For press inquiries, interview requests, or media coverage, please reach out directly.</p>',
        tag: "p",
      }),
      createBlock("button", {
        label: "press@diagonally.org",
        href: "mailto:press@diagonally.org",
        variant: "primary",
        size: "md",
      }),
    ]),
  ]
}

// ─── Page Definitions ─────────────────────────────────────────────────────────

const ALL_PAGES = [
  {
    slug: "home",
    title: "Home",
    sections: buildHomeSections,
    showInNav: true,
    navOrder: 1,
    navLabel: "Home",
  },
  {
    slug: "about",
    title: "About",
    sections: buildAboutSections,
    showInNav: true,
    navOrder: 2,
    navLabel: "About",
  },
  {
    slug: "schools",
    title: "For Schools",
    sections: buildSchoolsSections,
    showInNav: true,
    navOrder: 3,
    navLabel: "For Schools",
  },
  {
    slug: "parents",
    title: "For Parents",
    sections: buildParentsSections,
    showInNav: true,
    navOrder: 4,
    navLabel: "For Parents",
  },
  {
    slug: "research",
    title: "Research",
    sections: buildResearchSections,
    showInNav: true,
    navOrder: 6,
    navLabel: "Research",
  },
  {
    slug: "contact",
    title: "Contact",
    sections: buildContactSections,
    showInNav: false,
    navOrder: 0,
    navLabel: "",
  },
  {
    slug: "press",
    title: "Press",
    sections: buildPressSections,
    showInNav: false,
    navOrder: 0,
    navLabel: "",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MigratePages() {
  const [status, setStatus] = useState("")
  const [migrating, setMigrating] = useState(false)
  const [done, setDone] = useState(false)

  async function handleMigrate() {
    setMigrating(true)
    setDone(false)

    for (const page of ALL_PAGES) {
      setStatus(`Migrating ${page.title}...`)
      const sections = page.sections()
      await setDoc(
        doc(db, "pages", page.slug),
        {
          slug: page.slug,
          title: page.title,
          draftSections: sections,
          publishedSections: sections,
          showInNav: page.showInNav,
          navOrder: page.navOrder,
          navLabel: page.navLabel,
          publishedAt: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lastEditedBy: "migration",
          lastEditedAt: Timestamp.now(),
        },
        { merge: true }
      )
    }

    setStatus("Done! All 7 pages migrated to Firestore.")
    setMigrating(false)
    setDone(true)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-3xl text-white">Migrate Static Pages</h1>
        <p className="mt-2 text-text-light/70">
          This will create Firestore page documents from the current static pages. Existing pages
          with the same slug will be updated (merge: true).
        </p>
      </div>

      <div className="bg-space-mid rounded-2xl p-6 space-y-3">
        <h2 className="font-display text-sm font-semibold text-white/60 uppercase tracking-widest">
          Pages to migrate
        </h2>
        <ul className="space-y-2">
          {ALL_PAGES.map((p) => (
            <li key={p.slug} className="flex items-center gap-3 text-text-light/80 text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-primary/60 flex-shrink-0" />
              <span className="font-medium">{p.title}</span>
              <span className="text-text-light/40">/{p.slug}</span>
              {p.showInNav && (
                <span className="ml-auto text-xs text-emerald/80 font-medium">in nav</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleMigrate}
        disabled={migrating}
        className="bg-blue-primary text-white px-6 py-3 rounded-xl font-medium disabled:opacity-50 hover:bg-blue-primary/90 transition-colors"
      >
        {migrating ? "Migrating..." : "Migrate All Pages"}
      </button>

      {status && (
        <p className={`font-medium ${done ? "text-emerald" : "text-blue-primary"}`}>
          {status}
        </p>
      )}
    </div>
  )
}
