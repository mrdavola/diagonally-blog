"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { X, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/components/admin/auth-provider"
import { loadSiteStyles, saveSiteStyles } from "@/lib/visual-editor/firestore"
import { defaultSiteStyles } from "@/lib/visual-editor/defaults"
import type { SiteStyles } from "@/lib/visual-editor/types"

// ─── Shared UI primitives ─────────────────────────────────────────────────────

const labelCls = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1"
const inputCls =
  "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white"

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </h3>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface GlobalStylesPanelProps {
  onClose: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function GlobalStylesPanel({ onClose }: GlobalStylesPanelProps) {
  const { user } = useAuth()
  const [styles, setStyles] = useState<SiteStyles>(defaultSiteStyles())
  const [saveIndicator, setSaveIndicator] = useState<"idle" | "saving" | "saved">("idle")
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didLoad = useRef(false)

  // ─── Load on mount ─────────────────────────────────────────────────────

  useEffect(() => {
    loadSiteStyles().then((loaded) => {
      setStyles(loaded)
      didLoad.current = true
    })
  }, [])

  // ─── Debounced save ────────────────────────────────────────────────────

  const scheduleSave = useCallback(
    (next: SiteStyles) => {
      if (!didLoad.current) return
      setSaveIndicator("saving")
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(async () => {
        try {
          await saveSiteStyles(next, user?.email ?? "unknown")
          setSaveIndicator("saved")
          setTimeout(() => setSaveIndicator("idle"), 2000)
        } catch (err) {
          console.error("[GlobalStylesPanel] Save failed:", err)
          setSaveIndicator("idle")
        }
      }, 2000)
    },
    [user?.email]
  )

  function update(next: SiteStyles) {
    setStyles(next)
    scheduleSave(next)
  }

  function updateTypography(patch: Partial<SiteStyles["typography"]>) {
    update({ ...styles, typography: { ...styles.typography, ...patch } })
  }

  function updateScale(patch: Partial<SiteStyles["typography"]["scale"]>) {
    update({
      ...styles,
      typography: {
        ...styles.typography,
        scale: { ...styles.typography.scale, ...patch },
      },
    })
  }

  function updateColor(key: keyof SiteStyles["colors"], value: string) {
    update({ ...styles, colors: { ...styles.colors, [key]: value } })
  }

  function updateButtons(patch: Partial<SiteStyles["buttons"]>) {
    update({ ...styles, buttons: { ...styles.buttons, ...patch } })
  }

  function updateSpacing(patch: Partial<SiteStyles["spacing"]>) {
    update({ ...styles, spacing: { ...styles.spacing, ...patch } })
  }

  const colors: { key: keyof SiteStyles["colors"]; label: string }[] = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "accent", label: "Accent" },
    { key: "background", label: "Background" },
    { key: "text", label: "Text" },
    { key: "muted", label: "Muted" },
  ]

  const scaleEntries: { key: keyof SiteStyles["typography"]["scale"]; label: string }[] = [
    { key: "h1", label: "H1" },
    { key: "h2", label: "H2" },
    { key: "h3", label: "H3" },
    { key: "h4", label: "H4" },
    { key: "body", label: "Body" },
    { key: "small", label: "Small" },
  ]

  return (
    <div className="fixed right-0 top-12 z-40 flex w-80 max-h-[calc(100vh-3rem)] flex-col overflow-hidden rounded-bl-xl rounded-tl-xl border border-gray-200 bg-white shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 shrink-0">
        <span className="text-sm font-semibold text-gray-900">Site Styles</span>
        <div className="flex items-center gap-2">
          {saveIndicator === "saving" && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 size={12} className="animate-spin" />
              Saving…
            </span>
          )}
          {saveIndicator === "saved" && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check size={12} />
              Saved
            </span>
          )}
          <button
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close panel"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Typography */}
        <div>
          <SectionHeader>Typography</SectionHeader>
          <Field label="Heading Font">
            <input
              type="text"
              className={inputCls}
              value={styles.typography.headingFont}
              onChange={(e) => updateTypography({ headingFont: e.target.value })}
              placeholder="Bricolage Grotesque"
            />
          </Field>
          <Field label="Body Font">
            <input
              type="text"
              className={inputCls}
              value={styles.typography.bodyFont}
              onChange={(e) => updateTypography({ bodyFont: e.target.value })}
              placeholder="Nunito"
            />
          </Field>
          <label className={labelCls}>Type Scale</label>
          <div className="grid grid-cols-2 gap-2">
            {scaleEntries.map(({ key, label }) => (
              <div key={key}>
                <label className="block text-xs text-gray-400 mb-0.5">{label}</label>
                <input
                  type="text"
                  className={inputCls}
                  value={styles.typography.scale[key]}
                  onChange={(e) => updateScale({ [key]: e.target.value })}
                  placeholder="1rem"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Colors */}
        <div>
          <SectionHeader>Colors</SectionHeader>
          <div className="space-y-2">
            {colors.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2">
                <div className="relative flex-shrink-0">
                  <input
                    type="color"
                    className="h-8 w-8 cursor-pointer rounded border border-gray-200 p-0.5"
                    value={
                      // color inputs need hex; oklch values fall back to black visually but still work
                      styles.colors[key].startsWith("#") ? styles.colors[key] : "#000000"
                    }
                    onChange={(e) => updateColor(key, e.target.value)}
                    title={label}
                  />
                </div>
                <label className="w-20 text-xs font-medium text-gray-600 shrink-0">{label}</label>
                <input
                  type="text"
                  className="flex-1 px-2 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 bg-white font-mono"
                  value={styles.colors[key]}
                  onChange={(e) => updateColor(key, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div>
          <SectionHeader>Buttons</SectionHeader>
          <Field label="Border Radius (px)">
            <input
              type="number"
              className={inputCls}
              value={styles.buttons.borderRadius}
              min={0}
              max={999}
              onChange={(e) => updateButtons({ borderRadius: Number(e.target.value) })}
            />
          </Field>
          <Field label="Default Style">
            <select
              className={inputCls}
              value={styles.buttons.defaultStyle}
              onChange={(e) =>
                updateButtons({ defaultStyle: e.target.value as SiteStyles["buttons"]["defaultStyle"] })
              }
            >
              <option value="filled">Filled</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
            </select>
          </Field>
          <Field label="Hover Effect">
            <select
              className={inputCls}
              value={styles.buttons.hoverEffect}
              onChange={(e) =>
                updateButtons({ hoverEffect: e.target.value as SiteStyles["buttons"]["hoverEffect"] })
              }
            >
              <option value="lift">Lift</option>
              <option value="darken">Darken</option>
              <option value="scale">Scale</option>
              <option value="none">None</option>
            </select>
          </Field>
        </div>

        {/* Spacing */}
        <div>
          <SectionHeader>Spacing</SectionHeader>
          <Field label="Section Padding (px)">
            <input
              type="number"
              className={inputCls}
              value={styles.spacing.sectionPadding}
              min={0}
              onChange={(e) => updateSpacing({ sectionPadding: Number(e.target.value) })}
            />
          </Field>
          <Field label="Content Max Width (px)">
            <input
              type="number"
              className={inputCls}
              value={styles.spacing.contentMaxWidth}
              min={0}
              onChange={(e) => updateSpacing({ contentMaxWidth: Number(e.target.value) })}
            />
          </Field>
          <Field label="Grid Gap (px)">
            <input
              type="number"
              className={inputCls}
              value={styles.spacing.gridGap}
              min={0}
              onChange={(e) => updateSpacing({ gridGap: Number(e.target.value) })}
            />
          </Field>
        </div>

      </div>
    </div>
  )
}
