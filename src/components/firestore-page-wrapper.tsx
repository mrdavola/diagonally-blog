"use client"

import { useState, useEffect } from "react"
import PageRenderer from "@/components/page-renderer"
import { getPublishedPageData } from "@/lib/visual-editor/firestore"
import type { PublishedPageData } from "@/lib/visual-editor/firestore"

interface FirestorePageWrapperProps {
  slug: string
  fallback: React.ReactNode
  loadingBg?: string
}

export default function FirestorePageWrapper({
  slug,
  fallback,
  loadingBg = "bg-cream",
}: FirestorePageWrapperProps) {
  const [pageData, setPageData] = useState<PublishedPageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPageData(slug)
      .then((data) => {
        setPageData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug])

  if (loading) return <div className={`min-h-screen ${loadingBg}`} />

  if (pageData?.publishedSections && pageData.publishedSections.length > 0) {
    return (
      <PageRenderer
        publishedSections={pageData.publishedSections}
        publishedBlocks={pageData.publishedBlocks}
      />
    )
  }

  return <>{fallback}</>
}
