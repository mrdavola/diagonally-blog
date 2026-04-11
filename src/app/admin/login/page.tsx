"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Logo } from "@/components/logo"
import { AuthProvider, useAuth } from "@/components/admin/auth-provider"

function LoginContent() {
  const { user, role, loading, signInWithGoogle, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user && role) {
      router.push("/admin")
    }
  }, [user, role, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-space-deep flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Logged in but not in allow-list
  if (user && !role) {
    return (
      <div className="min-h-screen bg-space-deep flex items-center justify-center p-4">
        <div className="bg-space-mid rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
          <Logo variant="light" size="md" />
          <h1 className="font-display text-2xl text-white mt-6 mb-2">
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

  return (
    <div className="min-h-screen bg-space-deep flex items-center justify-center p-4">
      <div className="bg-space-mid rounded-3xl p-8 shadow-lg max-w-md w-full">
        <div className="mb-8">
          <Logo variant="light" size="md" />
        </div>
        <h1 className="font-display text-2xl text-white mb-2">Admin Login</h1>
        <p className="text-text-light/70 mb-8">
          Sign in to manage your website
        </p>
        <button
          onClick={signInWithGoogle}
          className="bg-white text-text-dark rounded-xl py-3 px-6 font-medium hover:bg-white/90 transition w-full flex items-center justify-center gap-3"
        >
          <span className="font-bold text-blue-600">G</span>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginContent />
    </AuthProvider>
  )
}
