"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, PenSquare, Users, Inbox, Settings, LogOut, LayoutTemplate, Mail } from "lucide-react"
import { Logo } from "@/components/logo"
import { useAuth } from "@/components/admin/auth-provider"

const NAV_ITEMS = [
  { label: "Pages", icon: FileText, href: "/admin/pages" },
  { label: "Posts", icon: PenSquare, href: "/admin/posts" },
  { label: "Templates", icon: LayoutTemplate, href: "/admin/templates" },
  { label: "Authors", icon: Users, href: "/admin/authors" },
  { label: "Subscribers", icon: Mail, href: "/admin/subscribers" },
  { label: "Submissions", icon: Inbox, href: "/admin/submissions" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, role, signOut } = useAuth()

  return (
    <aside className="hidden md:flex flex-col bg-space-deep border-r border-admin-border-subtle w-14 lg:w-56 flex-shrink-0">
      {/* Logo — lg+ only */}
      <div className="hidden lg:flex items-center px-4 h-14 border-b border-admin-border-subtle flex-shrink-0">
        <Logo variant="light" size="sm" />
      </div>
      {/* Spacer on md (icon-only mode) */}
      <div className="flex lg:hidden h-14 border-b border-admin-border-subtle flex-shrink-0" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition mb-0.5 tracking-wide
                ${
                  isActive
                    ? "text-white bg-white/6"
                    : "text-text-light/60 hover:text-text-light/80 hover:bg-white/3"
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="hidden lg:block text-sm font-medium">{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User info + sign out — lg+ only */}
      <div className="border-t border-admin-border-subtle p-3">
        <div className="hidden lg:flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-deep/60 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-text-light/70 text-xs truncate">{user?.email}</p>
            {role && (
              <span className="text-xs text-blue-primary font-medium capitalize">
                {role}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-text-light/40 hover:text-text-light/70 hover:bg-white/3 transition"
          title="Sign out"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="hidden lg:block text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
