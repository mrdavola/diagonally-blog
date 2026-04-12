"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, PenSquare, Image as ImageIcon, Settings } from "lucide-react"

const TABS = [
  { label: "Pages", icon: FileText, href: "/admin/pages" },
  { label: "Posts", icon: PenSquare, href: "/admin/posts" },
  { label: "Assets", icon: ImageIcon, href: "/admin/assets" },
  { label: "Settings", icon: Settings, href: "/admin/settings" },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 w-full items-stretch border-t border-admin-border-subtle bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)] md:hidden">
      {TABS.map(({ label, icon: Icon, href }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/")
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors
              ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
