"use client"

import { useState } from "react"
import type { EditorBlock } from "@/lib/visual-editor/types"

interface TabItem {
  label: string
  content: string
}

interface TabsBlockProps {
  block: EditorBlock
}

export function TabsBlock({ block }: TabsBlockProps) {
  const [activeTab, setActiveTab] = useState(0)

  const rawTabs = Array.isArray(block.props.tabs) ? block.props.tabs : []
  const tabs: TabItem[] = rawTabs.filter(
    (t): t is TabItem =>
      typeof t === "object" &&
      t !== null &&
      typeof (t as TabItem).label === "string"
  )

  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No tabs configured
      </div>
    )
  }

  const safeActive = Math.min(activeTab, tabs.length - 1)

  return (
    <div className="w-full">
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveTab(i)}
            className={[
              "px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              i === safeActive
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4 text-gray-700 text-sm leading-relaxed">
        {tabs[safeActive]?.content ?? ""}
      </div>
    </div>
  )
}
