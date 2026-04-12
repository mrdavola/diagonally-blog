"use client"

import { useEffect, useState } from "react"
import { Users, Download, Loader2, Mail } from "lucide-react"
import { collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Subscriber {
  email: string
  subscribedAt: Date
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function timestampToDate(ts: unknown): Date {
  if (ts instanceof Timestamp) return ts.toDate()
  if (ts instanceof Date) return ts
  return new Date()
}

async function listSubscribers(): Promise<Subscriber[]> {
  const q = query(collection(db, "newsletter"), orderBy("subscribedAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data() as Record<string, unknown>
    return {
      email: (data.email as string) ?? d.id,
      subscribedAt: timestampToDate(data.subscribedAt),
    }
  })
}

function exportCSV(subscribers: Subscriber[]) {
  const rows = [
    ["Email", "Subscribed At"],
    ...subscribers.map((s) => [s.email, s.subscribedAt.toISOString()]),
  ]
  const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n")
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `subscribers-${new Date().toISOString().split("T")[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listSubscribers()
      .then(setSubscribers)
      .catch(() => setError("Failed to load subscribers. Check your connection."))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h1 className="text-white text-xl font-display font-semibold">Subscribers</h1>
            {!loading && !error && (
              <p className="text-text-light/50 text-sm">
                {subscribers.length} {subscribers.length === 1 ? "subscriber" : "subscribers"}
              </p>
            )}
          </div>
        </div>

        {subscribers.length > 0 && (
          <button
            onClick={() => exportCSV(subscribers)}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-text-light rounded-xl px-4 py-2 text-sm font-medium transition"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 animate-spin text-text-light/40" />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && subscribers.length === 0 && (
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <Mail className="w-10 h-10 text-text-light/20 mb-3" />
          <p className="text-text-light/50 text-sm">No subscribers yet.</p>
          <p className="text-text-light/30 text-xs mt-1">
            Subscribers will appear here after signing up on the site.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && !error && subscribers.length > 0 && (
        <div className="bg-space-mid/50 rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left text-xs font-medium text-text-light/40 uppercase tracking-wider px-6 py-3">
                  Email
                </th>
                <th className="text-left text-xs font-medium text-text-light/40 uppercase tracking-wider px-6 py-3">
                  Signed Up
                </th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => (
                <tr
                  key={s.email}
                  className={`${i !== subscribers.length - 1 ? "border-b border-white/5" : ""} hover:bg-white/5 transition`}
                >
                  <td className="px-6 py-3.5 text-sm text-text-light font-mono">
                    {s.email}
                  </td>
                  <td className="px-6 py-3.5 text-sm text-text-light/50">
                    {formatDate(s.subscribedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
