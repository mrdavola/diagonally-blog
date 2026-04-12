"use client"

import "@/styles/tiptap-editor.css"

import { useRef, useCallback, useState, useEffect } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight"
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Underline from "@tiptap/extension-underline"
import Superscript from "@tiptap/extension-superscript"
import Subscript from "@tiptap/extension-subscript"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Typography from "@tiptap/extension-typography"
import CharacterCount from "@tiptap/extension-character-count"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { all, createLowlight } from "lowlight"
import type { TiptapJSON } from "@/lib/blocks/types"
import { TiptapToolbar } from "./tiptap-toolbar"
import { SlashMenu, SlashMenuExtension } from "./tiptap-slash-menu"
import { Video, Embed, parseVideoUrl, detectEmbedProvider } from "./tiptap-extensions"
import { MediaDialog } from "./media-dialog"

const lowlight = createLowlight(all)

const EMPTY_DOC: TiptapJSON = { type: "doc", content: [{ type: "paragraph" }] }

interface TiptapEditorProps {
  content: TiptapJSON | null
  onChange: (content: TiptapJSON) => void
  onWordCountChange?: (count: number) => void
}

export function TiptapEditor({ content, onChange, onWordCountChange }: TiptapEditorProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaTab, setMediaTab] = useState<"image" | "video" | "embed">("image")

  const flushChange = useCallback(
    (getJSON: () => TiptapJSON) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      onChange(getJSON())
    },
    [onChange],
  )

  const scheduleChange = useCallback(
    (getJSON: () => TiptapJSON) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onChange(getJSON())
      }, 300)
    },
    [onChange],
  )

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      Video,
      Embed,
      CodeBlockLowlight.configure({ lowlight }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({ nested: true }),
      Underline,
      Superscript,
      Subscript,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Highlight.configure({ multicolor: true }),
      Typography,
      CharacterCount,
      TextStyle,
      Color,
      SlashMenuExtension,
    ],
    content: content ?? EMPTY_DOC,
    onUpdate({ editor: ed }) {
      scheduleChange(() => ed.getJSON() as TiptapJSON)
      onWordCountChange?.(ed.storage.characterCount.words() ?? 0)
    },
    onBlur({ editor: ed }) {
      flushChange(() => ed.getJSON() as TiptapJSON)
      onWordCountChange?.(ed.storage.characterCount.words() ?? 0)
    },
  })

  // Listen for slash-menu media events
  useEffect(() => {
    function handler(e: CustomEvent<{ tab: "image" | "video" | "embed" }>) {
      setMediaTab(e.detail.tab)
      setMediaOpen(true)
    }
    window.addEventListener("tiptap:media", handler as EventListener)
    return () => window.removeEventListener("tiptap:media", handler as EventListener)
  }, [])

  function handleInsertImage(src: string, alt: string, title: string) {
    editor?.chain().focus().setImage({ src, alt, title }).run()
    setMediaOpen(false)
  }

  function handleInsertVideo(url: string) {
    const { provider, videoId, src } = parseVideoUrl(url)
    editor
      ?.chain()
      .focus()
      .insertContent({ type: "video", attrs: { src, provider, videoId } })
      .run()
    setMediaOpen(false)
  }

  function handleInsertEmbed(url: string) {
    editor
      ?.chain()
      .focus()
      .insertContent({ type: "embed", attrs: { url, provider: detectEmbedProvider(url) } })
      .run()
    setMediaOpen(false)
  }

  function openMedia(tab: "image" | "video" | "embed") {
    setMediaTab(tab)
    setMediaOpen(true)
  }

  const wordCount = editor?.storage.characterCount.words() ?? 0
  const readTime = Math.max(1, Math.ceil(wordCount / 238))

  return (
    <>
      <div className="rounded-xl border border-white/10 bg-space-mid overflow-hidden">
        <TiptapToolbar editor={editor} onOpenMedia={openMedia} />
        <div className="relative">
          <div className="px-6 py-4 min-h-[400px] prose prose-invert max-w-none text-text-light">
            <EditorContent editor={editor} />
          </div>
          <SlashMenu editor={editor} />
        </div>
        <div className="px-6 py-2 border-t border-white/10 flex items-center justify-between text-xs text-text-light/40">
          <span>{wordCount} words</span>
          <span>~{readTime} min read</span>
        </div>
      </div>

      <MediaDialog
        open={mediaOpen}
        onOpenChange={setMediaOpen}
        onInsertImage={handleInsertImage}
        onInsertVideo={handleInsertVideo}
        onInsertEmbed={handleInsertEmbed}
        initialTab={mediaTab}
      />
    </>
  )
}
