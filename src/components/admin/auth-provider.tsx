"use client"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { ROLE_PERMISSIONS } from "@/lib/admin-config"
import type { Role } from "@/lib/admin-config"
import { getUserRole } from "@/lib/admins"

interface AuthContextType {
  user: User | null
  loading: boolean
  role: Role | null
  permissions: (typeof ROLE_PERMISSIONS)[Role] | null
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<Role | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser?.email) {
        const userRole = await getUserRole(firebaseUser.email)
        setRole(userRole)
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  const signOut = async () => {
    await firebaseSignOut(auth)
  }

  const permissions = role ? ROLE_PERMISSIONS[role] : null

  return (
    <AuthContext.Provider
      value={{ user, loading, role, permissions, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
