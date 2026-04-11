"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay },
})

export default function ContactContent() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [inquiryType, setInquiryType] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-cream py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.h1
            {...fadeUp(0)}
            className="font-display text-4xl md:text-5xl font-bold text-text-dark"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            {...fadeUp(0.15)}
            className="mt-6 text-lg md:text-xl text-text-dark/70 max-w-2xl mx-auto leading-relaxed"
          >
            Whether you&rsquo;re a school, parent, partner, or journalist — we&rsquo;d love to hear
            from you.
          </motion.p>
        </div>
      </section>

      {/* Form + Sidebar */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Form */}
            <motion.div
              {...fadeUp(0)}
              className="lg:w-3/5 bg-white rounded-3xl p-8 shadow-soft-md"
            >
              <h2 className="font-display text-xl font-bold text-text-dark mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-text-dark mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="w-full border border-text-dark/15 rounded-xl px-4 py-3 text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-blue-primary/40 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-text-dark mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full border border-text-dark/15 rounded-xl px-4 py-3 text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-blue-primary/40 transition"
                  />
                </div>

                <div>
                  <label
                    htmlFor="inquiry"
                    className="block text-sm font-semibold text-text-dark mb-1.5"
                  >
                    Inquiry Type
                  </label>
                  <select
                    id="inquiry"
                    value={inquiryType}
                    onChange={(e) => setInquiryType(e.target.value)}
                    className="w-full border border-text-dark/15 rounded-xl px-4 py-3 text-text-dark focus:outline-none focus:ring-2 focus:ring-blue-primary/40 transition bg-white"
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    <option value="school">School / District</option>
                    <option value="parent">Parent / Family</option>
                    <option value="partnership">Partnership</option>
                    <option value="press">Press / Media</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-semibold text-text-dark mb-1.5"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    className="w-full border border-text-dark/15 rounded-xl px-4 py-3 text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:ring-2 focus:ring-blue-primary/40 transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-deep text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </motion.div>

            {/* Sidebar */}
            <motion.div {...fadeUp(0.15)} className="lg:w-2/5 flex flex-col gap-4">
              {/* Schedule */}
              <div className="bg-cream-dark rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-text-dark mb-2">
                  Schedule a Call
                </h3>
                <p className="text-text-dark/70 text-sm leading-relaxed mb-4">
                  Prefer to chat? Book a time that works for you.
                </p>
                <a
                  href="#"
                  className="inline-block bg-blue-deep text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                >
                  Schedule a Call
                </a>
              </div>

              {/* Quick Links */}
              <div className="bg-cream-dark rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-text-dark mb-4">
                  Quick Links
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/schools"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      For Schools
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/parents"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      For Parents
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/research"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      Research &amp; Results
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Social */}
              <div className="bg-cream-dark rounded-2xl p-6">
                <h3 className="font-display text-lg font-bold text-text-dark mb-4">Follow Along</h3>
                <ul className="space-y-2">
                  <li>
                    <a
                      href="https://twitter.com/diagonallyorg"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      Twitter / X
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://linkedin.com/company/diagonally"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      LinkedIn
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://github.com/diagonally"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-deep font-medium text-sm hover:underline"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
