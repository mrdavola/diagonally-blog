"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import PageRenderer from "@/components/page-renderer"
import { getPublishedPageData } from "@/lib/visual-editor/firestore"
import type { PublishedPageData } from "@/lib/visual-editor/firestore"

export default function DynamicPage() {
  const params = useParams()
  const slugParts = params.slug as string[]
  const slug = slugParts ? slugParts.join("/") : ""
  const [pageData, setPageData] = useState<PublishedPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) {
      setLoading(false)
      return
    }
    getPublishedPageData(slug)
      .then((data) => {
        setPageData(data)
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

  return (
    <PageRenderer
      publishedSections={pageData?.publishedSections}
      publishedBlocks={pageData?.publishedBlocks}
    />
  )
}
