"use client"

import { use } from "react"
import { PageEditor } from "@/components/admin/page-editor"

interface PageEditorRouteProps {
  params: Promise<{ slug: string }>
}

export default function PageEditorRoute({ params }: PageEditorRouteProps) {
  const { slug } = use(params)
  return (
    <div className="h-full -m-6 flex flex-col">
      <PageEditor slug={slug} />
    </div>
  )
}
