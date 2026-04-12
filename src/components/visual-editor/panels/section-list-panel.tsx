"use client"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, X, Plus } from "lucide-react"
import { useEditorStore } from "@/lib/visual-editor/editor-store"
import type { Section } from "@/lib/visual-editor/types"

// ─── SortableSectionCard ─────────────────────────────────────────────────────

interface SortableSectionCardProps {
  section: Section
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function SortableSectionCard({ section, isSelected, onSelect, onDelete }: SortableSectionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (window.confirm(`Delete section "${section.label}"?`)) {
      onDelete(section.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(section.id)}
      className={`flex items-center gap-2 rounded-lg px-2 py-2 mb-1 border cursor-pointer transition-colors ${
        isSelected
          ? "border-blue-200 bg-blue-50"
          : "border-gray-100 bg-white hover:bg-gray-50"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Label & template */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{section.label}</p>
        <p className="text-xs text-gray-400 truncate">{section.templateId}</p>
      </div>

      {/* Delete button */}
      <button
        onClick={handleDelete}
        className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
        title="Delete section"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// ─── SectionListPanel ────────────────────────────────────────────────────────

interface SectionListPanelProps {
  onClose: () => void
  onAddSection: () => void
}

export function SectionListPanel({ onClose, onAddSection }: SectionListPanelProps) {
  const sections = useEditorStore((s) => s.sections)
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId)
  const selectSection = useEditorStore((s) => s.selectSection)
  const reorderSections = useEditorStore((s) => s.reorderSections)
  const deleteSection = useEditorStore((s) => s.deleteSection)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((s) => s.id === active.id)
    const newIndex = sections.findIndex((s) => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      reorderSections(oldIndex, newIndex)
    }
  }

  function handleDelete(id: string) {
    deleteSection(id)
  }

  return (
    <div className="absolute left-0 top-0 bottom-0 z-40 w-[260px] bg-white border-r border-gray-200 shadow-sm flex flex-col rounded-r-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-100 shrink-0">
        <span className="text-sm font-semibold text-gray-800">Sections</span>
        <button
          onClick={onClose}
          className="h-6 w-6 flex items-center justify-center rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sections.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-8">No sections yet.</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSectionCard
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={selectSection}
                  onDelete={handleDelete}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add section button */}
      <div className="p-2 border-t border-gray-100 shrink-0">
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-800 border-2 border-dashed border-gray-200 hover:border-gray-300 rounded-lg py-2.5 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>
    </div>
  )
}
