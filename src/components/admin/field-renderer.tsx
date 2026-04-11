"use client"

import type { FieldSchema } from "@/lib/blocks/registry"
import { ImageField } from "./image-field"
import { Plus, Trash2 } from "lucide-react"

interface FieldRendererProps {
  field: FieldSchema
  value: unknown
  onChange: (value: unknown) => void
}

const inputClass =
  "w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50 transition"

const labelClass = "block text-text-light/70 text-sm font-medium mb-1.5"

export function FieldRenderer({ field, value, onChange }: FieldRendererProps) {
  return (
    <div className="mb-4">
      <label className={labelClass}>{field.label}</label>
      <FieldInput field={field} value={value} onChange={onChange} />
    </div>
  )
}

function FieldInput({ field, value, onChange }: FieldRendererProps) {
  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )

    case "textarea":
      return (
        <textarea
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          rows={3}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      )

    case "richtext":
      return (
        <textarea
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          rows={6}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y font-mono text-xs`}
        />
      )

    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={(value as string) ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-9 h-9 rounded border border-white/10 bg-transparent cursor-pointer"
          />
          <input
            type="text"
            value={(value as string) ?? ""}
            placeholder="#000000"
            onChange={(e) => onChange(e.target.value)}
            className={`${inputClass} flex-1`}
          />
        </div>
      )

    case "url":
      return (
        <input
          type="url"
          value={(value as string) ?? ""}
          placeholder={field.placeholder ?? "https://"}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )

    case "select":
      return (
        <select
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} appearance-none`}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-space-deep">
              {opt.label}
            </option>
          ))}
        </select>
      )

    case "number":
      return (
        <input
          type="number"
          value={(value as number) ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={inputClass}
        />
      )

    case "toggle":
      return (
        <div className="flex items-center gap-3">
          <button
            role="switch"
            aria-checked={!!(value as boolean)}
            onClick={() => onChange(!(value as boolean))}
            className={`relative w-10 h-6 rounded-full transition-colors ${
              value ? "bg-blue-600" : "bg-white/20"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                value ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
          <span className="text-sm text-text-light/60">
            {value ? "Enabled" : "Disabled"}
          </span>
        </div>
      )

    case "image":
      return (
        <ImageField
          value={(value as string) ?? ""}
          onChange={onChange}
        />
      )

    case "array":
      return (
        <ArrayField field={field} value={value} onChange={onChange} />
      )

    default:
      return (
        <p className="text-xs text-text-light/40">
          Unknown field type: {(field as FieldSchema).type}
        </p>
      )
  }
}

function ArrayField({ field, value, onChange }: FieldRendererProps) {
  const items = (value as Record<string, unknown>[]) ?? []
  const subFields = field.arrayFields ?? []

  function addItem() {
    const newItem: Record<string, unknown> = {}
    for (const f of subFields) {
      newItem[f.key] = ""
    }
    onChange([...items, newItem])
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, key: string, val: unknown) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [key]: val } : item
    )
    onChange(updated)
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-space-deep/40 border border-white/10 rounded-lg p-3"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-light/40 font-medium">
              Item {index + 1}
            </span>
            <button
              onClick={() => removeItem(index)}
              className="text-red-400/50 hover:text-red-400 transition"
              title="Remove item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {subFields.map((subField) => (
              <div key={subField.key}>
                <label className="block text-text-light/50 text-xs mb-1">
                  {subField.label}
                </label>
                <FieldInput
                  field={subField}
                  value={item[subField.key]}
                  onChange={(val) => updateItem(index, subField.key, val)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-text-light/50 hover:text-white border border-dashed border-white/20 hover:border-white/40 rounded-lg py-2 transition"
      >
        <Plus className="w-3.5 h-3.5" />
        Add item
      </button>
    </div>
  )
}
