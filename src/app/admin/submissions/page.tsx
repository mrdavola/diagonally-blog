"use client"

import { useEffect, useState } from "react"
import { Inbox, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { listSubmissions, updateSubmissionStatus } from "@/lib/submissions"
import type { Submission } from "@/lib/blocks/types"

type FilterTab = "all" | Submission["type"]

const TABS: { value: FilterTab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "demo", label: "Demo Requests" },
  { value: "waitlist", label: "Waitlist" },
  { value: "contact", label: "Contact" },
  { value: "newsletter", label: "Newsletter" },
]

const TYPE_LABELS: Record<Submission["type"], string> = {
  demo: "Demo Request",
  waitlist: "Waitlist",
  contact: "Contact",
  newsletter: "Newsletter",
}

const TYPE_COLORS: Record<Submission["type"], string> = {
  demo: "bg-purple-500/20 text-purple-400",
  waitlist: "bg-orange-500/20 text-orange-400",
  contact: "bg-sky-500/20 text-sky-400",
  newsletter: "bg-pink-500/20 text-pink-400",
}

const STATUS_COLORS: Record<Submission["status"], string> = {
  new: "bg-blue-500/20 text-blue-400",
  read: "bg-white/10 text-text-light/50",
  replied: "bg-emerald-500/20 text-emerald-400",
}

const STATUS_LABELS: Record<Submission["status"], string> = {
  new: "New",
  read: "Read",
  replied: "Replied",
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

interface SubmissionRowProps {
  submission: Submission
  onStatusChange: (id: string, status: Submission["status"]) => void
}

function SubmissionRow({ submission, onStatusChange }: SubmissionRowProps) {
  const [expanded, setExpanded] = useState(false)
  const [updating, setUpdating] = useState(false)

  async function handleStatus(status: Submission["status"]) {
    setUpdating(true)
    try {
      await updateSubmissionStatus(submission.id, status)
      onStatusChange(submission.id, status)
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="bg-space-deep/50 rounded-2xl border border-white/10 overflow-hidden">
      {/* Row header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white text-sm font-medium truncate">
              {submission.name || <span className="text-text-light/40 italic">No name</span>}
            </span>
            <span className="text-text-light/40 text-xs truncate">{submission.email}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[submission.type]}`}>
              {TYPE_LABELS[submission.type]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[submission.status]}`}>
              {STATUS_LABELS[submission.status]}
            </span>
            <span className="text-text-light/30 text-xs">
              {formatDate(submission.createdAt)}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-light/40 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-light/40 flex-shrink-0" />
        )}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-4">
          {/* Submission data */}
          {Object.keys(submission.data).length > 0 && (
            <div className="space-y-2">
              <p className="text-text-light/40 text-xs font-medium uppercase tracking-wider">
                Submission Data
              </p>
              <div className="bg-space-deep/50 rounded-xl p-3 space-y-1.5">
                {Object.entries(submission.data).map(([key, val]) => (
                  <div key={key} className="flex gap-3 text-sm">
                    <span className="text-text-light/40 font-medium min-w-[100px] flex-shrink-0 capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-white/80 break-words">{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-light/40 text-xs font-medium">Update status:</span>
            {updating ? (
              <Loader2 className="w-4 h-4 text-text-light/40 animate-spin" />
            ) : (
              <>
                {submission.status !== "read" && (
                  <button
                    onClick={() => handleStatus("read")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-text-light/50 hover:text-white transition"
                  >
                    Mark as Read
                  </button>
                )}
                {submission.status !== "replied" && (
                  <button
                    onClick={() => handleStatus("replied")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-emerald-500/30 hover:border-emerald-400/50 text-emerald-400 hover:text-emerald-300 transition"
                  >
                    Mark as Replied
                  </button>
                )}
                {submission.status !== "new" && (
                  <button
                    onClick={() => handleStatus("new")}
                    className="text-xs px-3 py-1.5 rounded-lg border border-blue-500/30 hover:border-blue-400/50 text-blue-400 hover:text-blue-300 transition"
                  >
                    Mark as New
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  useEffect(() => {
    const type = activeTab === "all" ? undefined : activeTab
    setLoading(true)
    listSubmissions(type)
      .then(setSubmissions)
      .catch(() => setSubmissions([]))
      .finally(() => setLoading(false))
  }, [activeTab])

  function handleStatusChange(id: string, status: Submission["status"]) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-white">Submissions</h1>
        {!loading && (
          <span className="text-text-light/40 text-sm">
            {submissions.length} {submissions.length === 1 ? "submission" : "submissions"}
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-6 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${
              activeTab === tab.value
                ? "bg-white/10 text-white"
                : "text-text-light/50 hover:text-text-light/80 hover:bg-white/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-text-light/50 text-sm py-12 text-center flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading submissions…
        </div>
      ) : submissions.length === 0 ? (
        <div className="bg-space-deep/50 rounded-2xl p-12 border border-white/10 flex flex-col items-center gap-4 text-center">
          <Inbox className="w-10 h-10 text-text-light/20" />
          <p className="text-text-light/60 text-sm">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <SubmissionRow
              key={sub.id}
              submission={sub}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
