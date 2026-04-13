"use client"

import { useState } from "react"
import type { EditorBlock } from "@/lib/visual-editor/types"

interface FormField {
  label: string
  type: string
  required?: boolean
}

interface FormBlockProps {
  block: EditorBlock
}

export function FormBlock({ block }: FormBlockProps) {
  const rawFields = Array.isArray(block.props.fields) ? block.props.fields : []
  const fields: FormField[] = rawFields.filter(
    (f): f is FormField =>
      typeof f === "object" &&
      f !== null &&
      typeof (f as FormField).label === "string"
  )
  const submitLabel =
    typeof block.props.submitLabel === "string"
      ? block.props.submitLabel
      : "Submit"

  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(label: string, value: string) {
    setValues((prev) => ({ ...prev, [label]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error("Submission failed")
      setSuccess(true)
      setValues({})
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No form fields configured
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex items-center justify-center w-full py-8 text-green-600 text-sm font-medium">
        Thank you! Your message has been sent.
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={handleSubmit}>
      {fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none resize-none h-24"
              placeholder={field.label}
              required={field.required}
              value={values[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
          ) : field.type === "select" ? (
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none bg-white"
              required={field.required}
              value={values[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
            >
              <option value="">Select {field.label}</option>
            </select>
          ) : (
            <input
              type={field.type ?? "text"}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder={field.label}
              required={field.required}
              value={values[field.label] ?? ""}
              onChange={(e) => handleChange(field.label, e.target.value)}
            />
          )}
        </div>
      ))}
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-2 self-start rounded-xl bg-blue-deep px-6 py-2.5 text-sm font-medium text-white hover:opacity-80 transition-colors disabled:opacity-50"
      >
        {loading ? "Sending…" : submitLabel}
      </button>
    </form>
  )
}
