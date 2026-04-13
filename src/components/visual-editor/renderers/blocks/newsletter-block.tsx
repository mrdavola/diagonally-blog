"use client"

import { useState } from "react"
import type { EditorBlock } from "@/lib/visual-editor/types"

interface NewsletterBlockProps {
  block: EditorBlock
}

export function NewsletterBlock({ block }: NewsletterBlockProps) {
  const heading =
    typeof block.props.heading === "string"
      ? block.props.heading
      : "Stay in the loop"
  const placeholder =
    typeof block.props.placeholder === "string"
      ? block.props.placeholder
      : "Enter your email"
  const buttonLabel =
    typeof block.props.buttonLabel === "string"
      ? block.props.buttonLabel
      : "Subscribe"

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error("Subscription failed")
      setSuccess(true)
      setEmail("")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col gap-4 py-2">
        {heading && (
          <p className="text-lg font-semibold text-gray-900">{heading}</p>
        )}
        <p className="text-sm text-green-600 font-medium">
          You&apos;re subscribed!
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 py-2">
      {heading && (
        <p className="text-lg font-semibold text-gray-900">{heading}</p>
      )}
      <form className="flex gap-2 flex-wrap" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder={placeholder}
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 min-w-0 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex-shrink-0 rounded-xl bg-blue-deep px-5 py-2 text-sm font-medium text-white hover:opacity-80 transition-colors disabled:opacity-50"
        >
          {loading ? "…" : buttonLabel}
        </button>
      </form>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}
