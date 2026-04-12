"use client"

import { Node, mergeAttributes } from "@tiptap/core"

// ─── Video extension ──────────────────────────────────────────────────────────

export const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: null }, // "youtube" | "vimeo" | "direct"
      videoId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: "div[data-video]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-video": "" }, HTMLAttributes)]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.classList.add("tiptap-video-wrapper")

      const src = node.attrs.src as string
      const provider = node.attrs.provider as string
      const videoId = node.attrs.videoId as string

      if (provider === "youtube" && videoId) {
        dom.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:0.75rem;"></iframe>`
      } else if (provider === "vimeo" && videoId) {
        dom.innerHTML = `<iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen style="width:100%;aspect-ratio:16/9;border-radius:0.75rem;"></iframe>`
      } else if (src) {
        dom.innerHTML = `<video src="${src}" controls style="width:100%;border-radius:0.75rem;"></video>`
      }

      return { dom }
    }
  },
})

// ─── Embed extension ──────────────────────────────────────────────────────────

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      provider: { default: null }, // "twitter" | "instagram" | "codepen" | "generic"
    }
  },

  parseHTML() {
    return [{ tag: "div[data-embed]" }]
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes({ "data-embed": "" }, HTMLAttributes)]
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div")
      dom.classList.add("tiptap-embed-wrapper")

      const url = node.attrs.url as string
      dom.innerHTML = `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:0.75rem;padding:1rem;"><p style="font-size:0.875rem;color:rgba(226,232,240,0.6);margin:0 0 0.5rem;">Embedded content</p><a href="${url}" style="color:#60a5fa;font-size:0.875rem;word-break:break-all;" target="_blank" rel="noopener">${url}</a></div>`

      return { dom }
    }
  },
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function parseVideoUrl(url: string): {
  provider: string
  videoId: string | null
  src: string
} {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  )
  if (ytMatch) return { provider: "youtube", videoId: ytMatch[1], src: url }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { provider: "vimeo", videoId: vimeoMatch[1], src: url }

  // Direct video file
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { provider: "direct", videoId: null, src: url }

  return { provider: "unknown", videoId: null, src: url }
}

export function detectEmbedProvider(url: string): string {
  if (/twitter\.com|x\.com/i.test(url)) return "twitter"
  if (/instagram\.com/i.test(url)) return "instagram"
  if (/codepen\.io/i.test(url)) return "codepen"
  return "generic"
}
