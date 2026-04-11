"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Menu, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/admin/auth-provider"

const ROUTE_LABELS: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/pages": "Pages",
  "/admin/posts": "Posts",
  "/admin/authors": "Authors",
  "/admin/submissions": "Submissions",
  "/admin/settings": "Settings",
}

function getPageTitle(pathname: string): string {
  if (ROUTE_LABELS[pathname]) return ROUTE_LABELS[pathname]
  // Try prefix match
  const match = Object.entries(ROUTE_LABELS)
    .filter(([k]) => k !== "/admin" && pathname.startsWith(k))
    .sort((a, b) => b[0].length - a[0].length)[0]
  return match ? match[1] : "Admin"
}

export function AdminHeader() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const title = getPageTitle(pathname)

  return (
    <header className="sticky top-0 z-10 bg-space-mid border-b border-white/10 h-14 flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: hamburger (mobile) + page title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-1.5 rounded-lg text-text-light/60 hover:text-white hover:bg-white/5 transition"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-display text-white font-semibold text-base">
          {title}
        </h2>
      </div>

      {/* Right: user menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-text-light/70 hover:text-white hover:bg-white/5 transition"
        >
          <div className="w-7 h-7 rounded-full bg-blue-primary flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="hidden sm:block text-sm max-w-[120px] truncate">
            {user?.email}
          </span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {dropdownOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            />
            <div className="absolute right-0 top-full mt-1 z-20 bg-space-deep border border-white/10 rounded-xl shadow-lg py-1 min-w-[140px]">
              <button
                onClick={() => {
                  setDropdownOpen(false)
                  signOut()
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-text-light/70 hover:text-white hover:bg-white/5 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  )
}
