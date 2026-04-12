"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import type { EditorBlock } from "@/lib/visual-editor/types"
import { AssetLibrary } from "./asset-library"

// ─── Shared field components ──────────────────────────────────────────────────

const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
const inputCls = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      className={inputCls}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function Textarea({
  value,
  onChange,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  rows?: number
}) {
  return (
    <textarea
      className={inputCls}
      value={value ?? ""}
      rows={rows}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      className={inputCls}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function NumberInput({
  value,
  onChange,
  min,
  max,
}: {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
}) {
  return (
    <input
      type="number"
      className={inputCls}
      value={value ?? 0}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
    />
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ContentTabProps {
  block: EditorBlock
  sectionId: string
  onUpdateProps: (props: Record<string, unknown>) => void
}

// ─── Block-specific renderers ─────────────────────────────────────────────────

function ImageContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  const [assetLibraryOpen, setAssetLibraryOpen] = useState(false)

  return (
    <>
      <div className="mb-3">
        <label className={labelCls}>Image URL</label>
        <div className="flex gap-2">
          <input
            type="text"
            className={`${inputCls} flex-1`}
            value={p.src ?? ""}
            placeholder="https://..."
            onChange={(e) => onUpdateProps({ src: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setAssetLibraryOpen(true)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Browse Assets"
          >
            <ImageIcon size={13} />
            Browse
          </button>
        </div>
      </div>
      <Field label="Alt text">
        <TextInput value={p.alt ?? ""} onChange={(v) => onUpdateProps({ alt: v })} placeholder="Describe the image" />
      </Field>
      <Field label="Caption">
        <TextInput value={p.caption ?? ""} onChange={(v) => onUpdateProps({ caption: v })} placeholder="Optional caption" />
      </Field>

      <AssetLibrary
        open={assetLibraryOpen}
        onClose={() => setAssetLibraryOpen(false)}
        onSelect={(url, alt) => onUpdateProps({ src: url, ...(alt ? { alt } : {}) })}
      />
    </>
  )
}

function ButtonContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Label">
        <TextInput value={p.label ?? ""} onChange={(v) => onUpdateProps({ label: v })} placeholder="Button text" />
      </Field>
      <Field label="URL">
        <TextInput value={p.href ?? ""} onChange={(v) => onUpdateProps({ href: v })} placeholder="https://..." />
      </Field>
      <Field label="Variant">
        <Select
          value={p.variant ?? "filled"}
          onChange={(v) => onUpdateProps({ variant: v })}
          options={[
            { value: "filled", label: "Filled" },
            { value: "outline", label: "Outline" },
            { value: "ghost", label: "Ghost" },
          ]}
        />
      </Field>
      <Field label="Align">
        <Select
          value={p.align ?? "center"}
          onChange={(v) => onUpdateProps({ align: v })}
          options={[
            { value: "left", label: "Left" },
            { value: "center", label: "Center" },
            { value: "right", label: "Right" },
          ]}
        />
      </Field>
    </>
  )
}

function VideoContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Video URL">
        <TextInput value={p.url ?? ""} onChange={(v) => onUpdateProps({ url: v })} placeholder="YouTube or Vimeo URL" />
      </Field>
      <Field label="Caption">
        <TextInput value={p.caption ?? ""} onChange={(v) => onUpdateProps({ caption: v })} />
      </Field>
    </>
  )
}

function IconContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, unknown>
  return (
    <>
      <Field label="Icon name">
        <TextInput
          value={String(p.icon ?? "")}
          onChange={(v) => onUpdateProps({ icon: v })}
          placeholder="e.g. Star, Heart, ArrowRight"
        />
      </Field>
      <Field label="Size (px)">
        <NumberInput value={Number(p.size ?? 24)} onChange={(v) => onUpdateProps({ size: v })} min={8} max={256} />
      </Field>
      <Field label="Color">
        <TextInput value={String(p.color ?? "#000000")} onChange={(v) => onUpdateProps({ color: v })} placeholder="#000000" />
      </Field>
    </>
  )
}

function SpacerContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, unknown>
  const height = Number(p.height ?? 40)
  return (
    <Field label="Height (px)">
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={4}
          max={400}
          value={height}
          onChange={(e) => onUpdateProps({ height: Number(e.target.value) })}
          className="flex-1"
        />
        <span className="w-10 text-right text-sm text-gray-600">{height}</span>
      </div>
    </Field>
  )
}

function DividerContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Style">
        <Select
          value={p.style ?? "solid"}
          onChange={(v) => onUpdateProps({ style: v })}
          options={[
            { value: "solid", label: "Solid" },
            { value: "dashed", label: "Dashed" },
            { value: "dotted", label: "Dotted" },
          ]}
        />
      </Field>
      <Field label="Color">
        <TextInput value={p.color ?? "#e5e7eb"} onChange={(v) => onUpdateProps({ color: v })} placeholder="#e5e7eb" />
      </Field>
    </>
  )
}

function AccordionContent({ block, onUpdateProps }: ContentTabProps) {
  const items = (block.props.items as Array<{ question: string; answer: string }>) ?? []

  function updateItem(index: number, field: "question" | "answer", value: string) {
    const next = items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    onUpdateProps({ items: next })
  }

  function addItem() {
    onUpdateProps({ items: [...items, { question: "", answer: "" }] })
  }

  function removeItem(index: number) {
    onUpdateProps({ items: items.filter((_, i) => i !== index) })
  }

  return (
    <div>
      {items.map((item, i) => (
        <div key={i} className="mb-3 rounded-lg border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Item {i + 1}</span>
            <button
              onClick={() => removeItem(i)}
              className="text-xs text-red-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
          <Field label="Question">
            <TextInput value={item.question} onChange={(v) => updateItem(i, "question", v)} />
          </Field>
          <Field label="Answer">
            <Textarea value={item.answer} onChange={(v) => updateItem(i, "answer", v)} />
          </Field>
        </div>
      ))}
      <button
        onClick={addItem}
        className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add item
      </button>
    </div>
  )
}

function StatsRowContent({ block, onUpdateProps }: ContentTabProps) {
  const stats = (block.props.stats as Array<{ value: string; label: string; prefix?: string; suffix?: string }>) ?? []

  function updateStat(index: number, field: string, value: string) {
    const next = stats.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    onUpdateProps({ stats: next })
  }

  function addStat() {
    onUpdateProps({ stats: [...stats, { value: "", label: "", prefix: "", suffix: "" }] })
  }

  function removeStat(index: number) {
    onUpdateProps({ stats: stats.filter((_, i) => i !== index) })
  }

  return (
    <div>
      {stats.map((stat, i) => (
        <div key={i} className="mb-3 rounded-lg border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Stat {i + 1}</span>
            <button onClick={() => removeStat(i)} className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field label="Value">
              <TextInput value={stat.value} onChange={(v) => updateStat(i, "value", v)} placeholder="1,234" />
            </Field>
            <Field label="Label">
              <TextInput value={stat.label} onChange={(v) => updateStat(i, "label", v)} placeholder="Users" />
            </Field>
            <Field label="Prefix">
              <TextInput value={stat.prefix ?? ""} onChange={(v) => updateStat(i, "prefix", v)} placeholder="$" />
            </Field>
            <Field label="Suffix">
              <TextInput value={stat.suffix ?? ""} onChange={(v) => updateStat(i, "suffix", v)} placeholder="%" />
            </Field>
          </div>
        </div>
      ))}
      <button
        onClick={addStat}
        className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add stat
      </button>
    </div>
  )
}

function CtaBannerContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Headline">
        <TextInput value={p.headline ?? ""} onChange={(v) => onUpdateProps({ headline: v })} />
      </Field>
      <Field label="Subtext">
        <Textarea value={p.subtext ?? ""} onChange={(v) => onUpdateProps({ subtext: v })} rows={2} />
      </Field>
      <Field label="Button label">
        <TextInput value={p.buttonLabel ?? ""} onChange={(v) => onUpdateProps({ buttonLabel: v })} />
      </Field>
      <Field label="Button URL">
        <TextInput value={p.buttonHref ?? ""} onChange={(v) => onUpdateProps({ buttonHref: v })} placeholder="https://..." />
      </Field>
    </>
  )
}

function NewsletterSignupContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Heading">
        <TextInput value={p.heading ?? ""} onChange={(v) => onUpdateProps({ heading: v })} />
      </Field>
      <Field label="Input placeholder">
        <TextInput value={p.placeholder ?? ""} onChange={(v) => onUpdateProps({ placeholder: v })} placeholder="Enter your email…" />
      </Field>
      <Field label="Button label">
        <TextInput value={p.buttonLabel ?? ""} onChange={(v) => onUpdateProps({ buttonLabel: v })} placeholder="Subscribe" />
      </Field>
    </>
  )
}

function FormContent({ block, onUpdateProps }: ContentTabProps) {
  const fields = (block.props.fields as Array<{ label: string; type: string; required: boolean }>) ?? []

  function updateField(index: number, key: string, value: unknown) {
    const next = fields.map((f, i) => (i === index ? { ...f, [key]: value } : f))
    onUpdateProps({ fields: next })
  }

  function addField() {
    onUpdateProps({ fields: [...fields, { label: "", type: "text", required: false }] })
  }

  function removeField(index: number) {
    onUpdateProps({ fields: fields.filter((_, i) => i !== index) })
  }

  return (
    <div>
      {fields.map((field, i) => (
        <div key={i} className="mb-3 rounded-lg border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Field {i + 1}</span>
            <button onClick={() => removeField(i)} className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
          <Field label="Label">
            <TextInput value={field.label} onChange={(v) => updateField(i, "label", v)} />
          </Field>
          <Field label="Type">
            <Select
              value={field.type}
              onChange={(v) => updateField(i, "type", v)}
              options={[
                { value: "text", label: "Text" },
                { value: "email", label: "Email" },
                { value: "textarea", label: "Textarea" },
                { value: "select", label: "Select" },
                { value: "checkbox", label: "Checkbox" },
              ]}
            />
          </Field>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(i, "required", e.target.checked)}
            />
            Required
          </label>
        </div>
      ))}
      <button
        onClick={addField}
        className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add field
      </button>
    </div>
  )
}

function CardContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, string>
  return (
    <>
      <Field label="Title">
        <TextInput value={p.title ?? ""} onChange={(v) => onUpdateProps({ title: v })} />
      </Field>
      <Field label="Body">
        <Textarea value={p.body ?? ""} onChange={(v) => onUpdateProps({ body: v })} />
      </Field>
      <Field label="Image URL">
        <TextInput value={p.imageUrl ?? ""} onChange={(v) => onUpdateProps({ imageUrl: v })} placeholder="https://..." />
      </Field>
    </>
  )
}

function PricingCardContent({ block, onUpdateProps }: ContentTabProps) {
  const p = block.props as Record<string, unknown>
  const features = (p.features as string[]) ?? []

  function updateFeature(index: number, value: string) {
    const next = features.map((f, i) => (i === index ? value : f))
    onUpdateProps({ features: next })
  }

  return (
    <>
      <Field label="Plan name">
        <TextInput value={String(p.name ?? "")} onChange={(v) => onUpdateProps({ name: v })} />
      </Field>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <div>
          <label className={labelCls}>Price</label>
          <TextInput value={String(p.price ?? "")} onChange={(v) => onUpdateProps({ price: v })} placeholder="49" />
        </div>
        <div>
          <label className={labelCls}>Period</label>
          <TextInput value={String(p.period ?? "")} onChange={(v) => onUpdateProps({ period: v })} placeholder="/mo" />
        </div>
      </div>
      <Field label="CTA label">
        <TextInput value={String(p.ctaLabel ?? "")} onChange={(v) => onUpdateProps({ ctaLabel: v })} placeholder="Get started" />
      </Field>
      <label className="mb-3 flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={Boolean(p.highlighted)}
          onChange={(e) => onUpdateProps({ highlighted: e.target.checked })}
        />
        Highlighted plan
      </label>
      <div>
        <label className={labelCls}>Features</label>
        {features.map((f, i) => (
          <div key={i} className="mb-1.5 flex items-center gap-2">
            <input
              type="text"
              className={inputCls}
              value={f}
              onChange={(e) => updateFeature(i, e.target.value)}
            />
            <button
              onClick={() => onUpdateProps({ features: features.filter((_, idx) => idx !== i) })}
              className="shrink-0 text-xs text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          onClick={() => onUpdateProps({ features: [...features, ""] })}
          className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-1.5 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
        >
          + Add feature
        </button>
      </div>
    </>
  )
}

function GalleryContent({ block, onUpdateProps }: ContentTabProps) {
  const images = (block.props.images as Array<{ src: string; alt: string }>) ?? []

  function updateImage(index: number, field: "src" | "alt", value: string) {
    const next = images.map((img, i) => (i === index ? { ...img, [field]: value } : img))
    onUpdateProps({ images: next })
  }

  function addImage() {
    onUpdateProps({ images: [...images, { src: "", alt: "" }] })
  }

  function removeImage(index: number) {
    onUpdateProps({ images: images.filter((_, i) => i !== index) })
  }

  return (
    <div>
      {images.map((img, i) => (
        <div key={i} className="mb-3 rounded-lg border border-gray-200 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">Image {i + 1}</span>
            <button onClick={() => removeImage(i)} className="text-xs text-red-400 hover:text-red-600">
              Remove
            </button>
          </div>
          <Field label="URL">
            <TextInput value={img.src} onChange={(v) => updateImage(i, "src", v)} placeholder="https://..." />
          </Field>
          <Field label="Alt text">
            <TextInput value={img.alt} onChange={(v) => updateImage(i, "alt", v)} />
          </Field>
        </div>
      ))}
      <button
        onClick={addImage}
        className="mt-1 w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600"
      >
        + Add image
      </button>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ContentTab(props: ContentTabProps) {
  const { block } = props

  switch (block.type) {
    case "text":
      return (
        <p className="text-sm text-gray-500">
          Click the text block on the canvas to edit it inline.
        </p>
      )
    case "image":
      return <ImageContent {...props} />
    case "button":
      return <ButtonContent {...props} />
    case "video":
    case "video-embed":
      return <VideoContent {...props} />
    case "icon":
      return <IconContent {...props} />
    case "spacer":
      return <SpacerContent {...props} />
    case "divider":
      return <DividerContent {...props} />
    case "accordion":
      return <AccordionContent {...props} />
    case "stats-row":
      return <StatsRowContent {...props} />
    case "cta-banner":
      return <CtaBannerContent {...props} />
    case "newsletter-signup":
      return <NewsletterSignupContent {...props} />
    case "form":
      return <FormContent {...props} />
    case "card":
      return <CardContent {...props} />
    case "pricing-card":
      return <PricingCardContent {...props} />
    case "gallery":
    case "image-carousel":
      return <GalleryContent {...props} />
    default:
      return (
        <p className="text-sm text-gray-500">
          Configure this block&apos;s properties in the content tab.
        </p>
      )
  }
}
