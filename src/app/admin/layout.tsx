"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AuthProvider, useAuth } from "@/components/admin/auth-provider"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminHeader } from "@/components/admin/admin-header"
import { MobileNav } from "@/components/visual-editor/shell/mobile-nav"

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, role, loading, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isLoginPage = pathname === "/admin/login"

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push("/admin/login")
    }
  }, [loading, user, isLoginPage, router])

  // Login page renders without auth guard shell
  if (isLoginPage) {
    return <>{children}</>
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-space-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Not logged in — redirect is handled by useEffect above, show spinner
  if (!user) {
    return (
      <div className="min-h-screen bg-space-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Logged in but not authorized
  if (!role) {
    return (
      <div className="min-h-screen bg-space-deep flex items-center justify-center p-4">
        <div className="bg-space-mid rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <h1 className="font-display text-2xl text-white mb-2">
            Access Denied
          </h1>
          <p className="text-text-light/70 mb-6">
            Your account ({user.email}) is not authorized to access the admin
            panel.
          </p>
          <button
            onClick={signOut}
            className="bg-white/10 hover:bg-white/20 text-white rounded-xl py-3 px-6 font-medium transition w-full"
          >
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // Authorized — render full admin shell
  return (
    <div className="flex h-screen bg-space-deep">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6 bg-space-mid">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  )
}
