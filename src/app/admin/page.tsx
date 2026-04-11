import Link from "next/link"
import { FileText, PenSquare, Users, Inbox } from "lucide-react"

const STAT_CARDS = [
  { label: "Pages", icon: FileText },
  { label: "Posts", icon: PenSquare },
  { label: "Authors", icon: Users },
  { label: "Submissions", icon: Inbox },
]

const QUICK_ACTIONS = [
  { label: "Edit Pages", href: "/admin/pages" },
  { label: "Write a Post", href: "/admin/posts" },
  { label: "View Submissions", href: "/admin/submissions" },
]

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-white mb-8">
        Welcome to Diagonally Admin
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {STAT_CARDS.map(({ label, icon: Icon }) => (
          <div
            key={label}
            className="bg-space-deep/50 rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <Icon className="w-5 h-5 text-blue-primary" />
              <span className="text-text-light/60 text-sm font-medium">
                {label}
              </span>
            </div>
            <p className="font-display text-3xl text-white">—</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-display text-lg text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          {QUICK_ACTIONS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-text-light rounded-xl px-5 py-2.5 text-sm font-medium transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
