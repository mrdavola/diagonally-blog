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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2, Plus } from "lucide-react"
import type { Block } from "@/lib/blocks/types"
import { BLOCK_REGISTRY } from "@/lib/blocks/registry"
import * as Icons from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface BlockListProps {
  blocks: Block[]
  selectedBlockId: string | null
  onSelect: (id: string) => void
  onReorder: (blocks: Block[]) => void
  onDelete: (id: string) => void
  onAdd: () => void
}

interface SortableItemProps {
  block: Block
  isSelected: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function SortableItem({ block, isSelected, onSelect, onDelete }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const definition = BLOCK_REGISTRY.get(block.type)
  const iconName = definition?.icon ?? "Box"
  const IconComponent = (Icons[iconName as keyof typeof Icons] as LucideIcon) ?? Icons.Box
  const label = definition?.label ?? block.type

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(block.id)}
      className={`flex items-center gap-2 rounded-xl p-3 mb-2 border cursor-pointer transition ${
        isSelected
          ? "border-blue-500/60 bg-blue-600/10"
          : "border-white/10 bg-space-deep/30 hover:bg-white/5"
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="text-text-light/30 hover:text-text-light/60 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
        title="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Icon */}
      <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center flex-shrink-0">
        <IconComponent className="w-3.5 h-3.5 text-text-light/60" />
      </div>

      {/* Label */}
      <span className="flex-1 text-sm text-white/80 truncate">{label}</span>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete(block.id)
        }}
        className="text-red-400/40 hover:text-red-400 transition flex-shrink-0"
        title="Delete block"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

export function BlockList({
  blocks,
  selectedBlockId,
  onSelect,
  onReorder,
  onDelete,
  onAdd,
}: BlockListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id)
      const newIndex = blocks.findIndex((b) => b.id === over.id)
      onReorder(arrayMove(blocks, oldIndex, newIndex))
    }
  }

  return (
    <div className="p-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {blocks.map((block) => (
            <SortableItem
              key={block.id}
              block={block}
              isSelected={selectedBlockId === block.id}
              onSelect={onSelect}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>

      {blocks.length === 0 && (
        <p className="text-center text-text-light/30 text-sm py-6">
          No blocks yet. Add one below.
        </p>
      )}

      <button
        onClick={onAdd}
        className="w-full flex items-center justify-center gap-2 text-sm text-text-light/50 hover:text-white border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl py-3 transition"
      >
        <Plus className="w-4 h-4" />
        Add Block
      </button>
    </div>
  )
}
