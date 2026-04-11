"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import BlockRenderer from "@/components/blocks/block-renderer"
import { getPublishedBlocks } from "@/lib/blocks/firestore"
import type { Block } from "@/lib/blocks/types"

export default function DynamicPage() {
  const params = useParams()
  const slugParts = params.slug as string[]
  const slug = slugParts ? slugParts.join("/") : ""
  const [blocks, setBlocks] = useState<Block[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    getPublishedBlocks(slug)
      .then((b) => {
        setBlocks(b)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!blocks || blocks.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-text-dark/50">Page not found</p>
      </div>
    )
  }

  return <BlockRenderer blocks={blocks} />
}
