"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import BlockRenderer from "@/components/blocks/block-renderer"
import { getDraftBlocks } from "@/lib/blocks/firestore"
import type { Block } from "@/lib/blocks/types"

function PreviewContent() {
  const params = useSearchParams()
  const slug = params.get("page") || "home"
  const [blocks, setBlocks] = useState<Block[]>([])

  // Listen for postMessage from admin editor
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === "blocks-update") {
        setBlocks(event.data.blocks)
      }
    }
    window.addEventListener("message", handler)
    return () => window.removeEventListener("message", handler)
  }, [])

  // Fallback: load from Firestore
  useEffect(() => {
    getDraftBlocks(slug).then(setBlocks).catch(() => {})
  }, [slug])

  return <BlockRenderer blocks={blocks} />
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream" />}>
      <PreviewContent />
    </Suspense>
  )
}
