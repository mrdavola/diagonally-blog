"use client"

import { useState } from "react"
import {
  Pilcrow,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Quote,
  Zap,
  List,
  Minus,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { ImageField } from "@/components/admin/image-field"
import type { ContentBlock } from "@/lib/blocks/types"

type BlockType = ContentBlock["type"]

const BLOCK_TYPES: { type: BlockType; label: string; icon: React.ElementType }[] = [
  { type: "paragraph", label: "Paragraph", icon: Pilcrow },
  { type: "heading", label: "Heading", icon: Heading1 },
  { type: "subheading", label: "Subheading", icon: Heading2 },
  { type: "image", label: "Image", icon: ImageIcon },
  { type: "quote", label: "Quote", icon: Quote },
  { type: "callout", label: "Callout", icon: Zap },
  { type: "list", label: "List", icon: List },
  { type: "divider", label: "Divider", icon: Minus },
]

function makeBlock(type: BlockType): ContentBlock {
  return {
    id: crypto.randomUUID(),
    type,
    content: "",
    imageUrl: "",
    accentColor: "#3b82f6",
  }
}

interface AddButtonProps {
  onAdd: (type: BlockType) => void
}

function AddBlockButton({ onAdd }: AddButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative flex justify-center my-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-text-light/30 hover:text-text-light/70 text-xs py-1 px-2 rounded-lg hover:bg-white/5 transition"
        title="Add block"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add block</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 z-20 bg-space-mid border border-white/10 rounded-xl shadow-xl p-2 grid grid-cols-2 gap-1 w-56">
            {BLOCK_TYPES.map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => { onAdd(type); setOpen(false) }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-light/70 hover:text-white hover:bg-white/5 text-sm transition text-left"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface BlockCardProps {
  block: ContentBlock
  index: number
  total: number
  onChange: (updated: ContentBlock) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function BlockCard({ block, index, total, onChange, onDelete, onMoveUp, onMoveDown }: BlockCardProps) {
  const TypeEntry = BLOCK_TYPES.find((b) => b.type === block.type)
  const Icon = TypeEntry?.icon ?? Pilcrow

  function set(patch: Partial<ContentBlock>) {
    onChange({ ...block, ...patch })
  }

  const baseInput =
    "w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50"
  const baseTextarea =
    "w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-500/50 resize-none"

  return (
    <div className="bg-space-deep/50 rounded-2xl p-4 border border-white/10 flex gap-3">
      {/* Type icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mt-0.5">
        <Icon className="w-4 h-4 text-text-light/40" />
      </div>

      {/* Content editor */}
      <div className="flex-1 min-w-0 space-y-2">
        {block.type === "paragraph" && (
          <textarea
            value={block.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Write a paragraph…"
            rows={3}
            className={baseTextarea}
          />
        )}

        {block.type === "heading" && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Heading text…"
            className={`${baseInput} font-display text-xl`}
          />
        )}

        {block.type === "subheading" && (
          <input
            type="text"
            value={block.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder="Subheading text…"
            className={`${baseInput} font-display text-lg`}
          />
        )}

        {block.type === "image" && (
          <>
            <ImageField
              value={block.imageUrl ?? ""}
              onChange={(url) => set({ imageUrl: url })}
            />
            <input
              type="text"
              value={block.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder="Caption (optional)…"
              className={baseInput}
            />
          </>
        )}

        {block.type === "quote" && (
          <>
            <textarea
              value={block.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder="Quote text…"
              rows={3}
              className={baseTextarea}
            />
            <input
              type="text"
              value={block.accentColor}
              onChange={(e) => set({ accentColor: e.target.value })}
              placeholder="Attribution (optional)…"
              className={baseInput}
            />
          </>
        )}

        {block.type === "callout" && (
          <>
            <textarea
              value={block.content}
              onChange={(e) => set({ content: e.target.value })}
              placeholder="Callout text…"
              rows={3}
              className={baseTextarea}
            />
            <div className="flex items-center gap-2">
              <label className="text-text-light/50 text-xs">Accent color:</label>
              <input
                type="color"
                value={block.accentColor ?? "#3b82f6"}
                onChange={(e) => set({ accentColor: e.target.value })}
                className="w-8 h-7 rounded cursor-pointer bg-transparent border border-white/10"
              />
              <span className="text-text-light/40 text-xs font-mono">
                {block.accentColor ?? "#3b82f6"}
              </span>
            </div>
          </>
        )}

        {block.type === "list" && (
          <textarea
            value={block.content}
            onChange={(e) => set({ content: e.target.value })}
            placeholder={"One item per line…\nItem 1\nItem 2\nItem 3"}
            rows={4}
            className={baseTextarea}
          />
        )}

        {block.type === "divider" && (
          <div className="py-2">
            <hr className="border-white/10" />
            <p className="text-text-light/30 text-xs text-center mt-2">— Divider —</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          title="Move up"
          className="text-text-light/30 hover:text-text-light/70 disabled:opacity-20 disabled:cursor-not-allowed transition p-1"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          title="Move down"
          className="text-text-light/30 hover:text-text-light/70 disabled:opacity-20 disabled:cursor-not-allowed transition p-1"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          title="Delete block"
          className="text-text-light/30 hover:text-red-400 transition p-1 mt-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface BlogContentEditorProps {
  sections: ContentBlock[]
  onChange: (sections: ContentBlock[]) => void
}

export function BlogContentEditor({ sections, onChange }: BlogContentEditorProps) {
  function insertBlock(type: BlockType, afterIndex: number) {
    const next = [...sections]
    next.splice(afterIndex + 1, 0, makeBlock(type))
    onChange(next)
  }

  function updateBlock(index: number, updated: ContentBlock) {
    const next = [...sections]
    next[index] = updated
    onChange(next)
  }

  function deleteBlock(index: number) {
    onChange(sections.filter((_, i) => i !== index))
  }

  function moveBlock(from: number, to: number) {
    if (to < 0 || to >= sections.length) return
    const next = [...sections]
    const [removed] = next.splice(from, 1)
    next.splice(to, 0, removed)
    onChange(next)
  }

  return (
    <div className="space-y-1">
      {/* Add button before first block */}
      <AddBlockButton onAdd={(type) => insertBlock(type, -1)} />

      {sections.map((block, i) => (
        <div key={block.id}>
          <BlockCard
            block={block}
            index={i}
            total={sections.length}
            onChange={(updated) => updateBlock(i, updated)}
            onDelete={() => deleteBlock(i)}
            onMoveUp={() => moveBlock(i, i - 1)}
            onMoveDown={() => moveBlock(i, i + 1)}
          />
          <AddBlockButton onAdd={(type) => insertBlock(type, i)} />
        </div>
      ))}

      {sections.length === 0 && (
        <div className="bg-space-deep/30 rounded-2xl p-8 border border-dashed border-white/10 text-center">
          <p className="text-text-light/40 text-sm">
            No content yet. Use the &quot;Add block&quot; button above to start writing.
          </p>
        </div>
      )}
    </div>
  )
}
