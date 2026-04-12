"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { collection, getCountFromServer } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { listPosts } from "@/lib/posts"
import type { PostDocument } from "@/lib/blocks/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface DashboardStats {
  totalViews: number
  publishedCount: number
  subscriberCount: number
  draftCount: number
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return (
    <div className="bg-space-mid rounded-xl p-6 border border-white/10 animate-pulse">
      <div className="h-3 w-20 bg-white/10 rounded mb-4" />
      <div className="h-8 w-16 bg-white/10 rounded" />
    </div>
  )
}

function TopPostsSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-3 w-4 bg-white/10 rounded" />
            <div className="h-3 w-48 bg-white/10 rounded" />
          </div>
          <div className="h-3 w-16 bg-white/10 rounded" />
        </div>
      ))}
    </div>
  )
}

function DraftCardSkeleton() {
  return (
    <div className="bg-space-mid rounded-xl p-5 border border-white/10 animate-pulse">
      <div className="h-4 w-3/4 bg-white/10 rounded mb-3" />
      <div className="h-3 w-1/2 bg-white/10 rounded mb-4" />
      <div className="h-7 w-16 bg-white/10 rounded" />
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-space-mid rounded-xl p-6 border border-white/10">
      <p className="text-sm text-text-light/50 mt-1">{label}</p>
      <p className="font-display text-3xl font-bold text-white mt-2">
        {value.toLocaleString()}
      </p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + "…" : str
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [topPosts, setTopPosts] = useState<PostDocument[]>([])
  const [recentDrafts, setRecentDrafts] = useState<PostDocument[]>([])

  useEffect(() => {
    async function fetchData() {
      try {
        const [posts, subSnap] = await Promise.all([
          listPosts(),
          getCountFromServer(collection(db, "newsletter")),
        ])

        const published = posts.filter((p) => p.status === "published")
        const drafts = posts.filter((p) => p.status === "draft")

        const totalViews = posts.reduce((sum, p) => sum + (p.viewCount ?? 0), 0)

        const top5 = [...published]
          .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
          .slice(0, 5)

        const recent4Drafts = [...drafts]
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 4)

        setStats({
          totalViews,
          publishedCount: published.length,
          subscriberCount: subSnap.data().count,
          draftCount: drafts.length,
        })
        setTopPosts(top5)
        setRecentDrafts(recent4Drafts)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      <h1 className="font-display text-2xl text-white mb-8">Dashboard</h1>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <StatCard label="Total Views" value={stats?.totalViews ?? 0} />
            <StatCard label="Posts Published" value={stats?.publishedCount ?? 0} />
            <StatCard label="Subscribers" value={stats?.subscriberCount ?? 0} />
            <StatCard label="Drafts" value={stats?.draftCount ?? 0} />
          </>
        )}
      </div>

      {/* ── Top Posts ── */}
      <div className="mb-10">
        <h2 className="font-display text-lg text-white mb-4">Top Posts by Views</h2>
        <div className="bg-space-mid rounded-xl border border-white/10 px-6 py-2">
          {loading ? (
            <TopPostsSkeleton />
          ) : topPosts.length === 0 ? (
            <p className="py-6 text-sm text-text-light/40 text-center">No published posts yet.</p>
          ) : (
            topPosts.map((post, i) => {
              const views = post.viewCount ?? 0
              return (
                <Link
                  key={post.slug}
                  href={`/admin/posts/${post.slug}`}
                  className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/5 -mx-6 px-6 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-text-light/30 text-sm w-5 shrink-0">{i + 1}.</span>
                    <span className="text-text-light text-sm truncate">
                      {truncate(post.title || "Untitled", 60)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    <span className="text-text-light/40 text-xs hidden sm:block">
                      {formatDate(post.publishedAt)}
                    </span>
                    <span className="text-text-light/60 text-sm">
                      {views.toLocaleString()} views
                    </span>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>

      {/* ── Recent Drafts ── */}
      <div>
        <h2 className="font-display text-lg text-white mb-4">Recent Drafts</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DraftCardSkeleton />
            <DraftCardSkeleton />
            <DraftCardSkeleton />
            <DraftCardSkeleton />
          </div>
        ) : recentDrafts.length === 0 ? (
          <p className="text-sm text-text-light/40">No drafts yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentDrafts.map((post) => (
              <div
                key={post.slug}
                className="bg-space-mid rounded-xl p-5 border border-white/10 flex flex-col"
              >
                <p className="text-text-light text-sm font-medium leading-snug mb-1 line-clamp-2">
                  {post.title || "Untitled"}
                </p>
                <p className="text-text-light/40 text-xs mb-4">
                  Updated {formatDate(post.updatedAt)}
                </p>
                <Link
                  href={`/admin/posts/${post.slug}`}
                  className="mt-auto self-start text-xs font-medium text-blue-primary hover:text-text-light border border-white/10 hover:border-white/20 rounded-lg px-3 py-1.5 transition"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
