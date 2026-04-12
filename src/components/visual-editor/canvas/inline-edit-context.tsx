"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface InlineEditState {
  editingBlockId: string | null
  startEditing: (blockId: string) => void
  stopEditing: () => void
}

export const InlineEditContext = createContext<InlineEditState>({
  editingBlockId: null,
  startEditing: () => {},
  stopEditing: () => {},
})

export function useInlineEdit() {
  return useContext(InlineEditContext)
}

// ─── Section ID context (threads sectionId down to blocks without prop-drilling) ───

export const SectionIdContext = createContext<string>("")

export function useSectionId() {
  return useContext(SectionIdContext)
}

// ─── Provider ────────────────────────────────────────────────────────────────

interface InlineEditProviderProps {
  children: ReactNode
}

export function InlineEditProvider({ children }: InlineEditProviderProps) {
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null)

  function startEditing(blockId: string) {
    setEditingBlockId(blockId)
  }

  function stopEditing() {
    setEditingBlockId(null)
  }

  return (
    <InlineEditContext.Provider value={{ editingBlockId, startEditing, stopEditing }}>
      {children}
    </InlineEditContext.Provider>
  )
}
