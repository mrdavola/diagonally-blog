"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/admin/auth-provider"
import { listAdmins, addAdmin, updateAdminRole, removeAdmin } from "@/lib/admins"
import type { AdminUser } from "@/lib/admins"
import type { Role } from "@/lib/admin-config"
import { Shield, UserPlus, Trash2, Crown, PenSquare, Eye, Users } from "lucide-react"

const ROLE_LABELS: Record<Role, { label: string; color: string; icon: typeof Crown }> = {
  superadmin: { label: "Super Admin", color: "text-gold bg-gold/10", icon: Crown },
  admin: { label: "Admin", color: "text-blue-primary bg-blue-primary/10", icon: Shield },
  editor: { label: "Editor", color: "text-emerald bg-emerald/10", icon: PenSquare },
  viewer: { label: "Viewer", color: "text-text-light/60 bg-white/5", icon: Eye },
}

const ROLE_OPTIONS: Role[] = ["superadmin", "admin", "editor", "viewer"]

export default function SettingsPage() {
  const { user, permissions } = useAuth()
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newName, setNewName] = useState("")
  const [newRole, setNewRole] = useState<Role>("editor")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadAdmins()
  }, [])

  async function loadAdmins() {
    setLoading(true)
    try {
      const list = await listAdmins()
      setAdmins(list)
    } catch {
      // silent
    }
    setLoading(false)
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail || !user?.email) return
    setError("")
    setSaving(true)
    try {
      await addAdmin(newEmail.toLowerCase().trim(), newRole, newName.trim(), user.email)
      setNewEmail("")
      setNewName("")
      setNewRole("editor")
      setShowAddForm(false)
      await loadAdmins()
    } catch (err) {
      setError(String(err))
    }
    setSaving(false)
  }

  async function handleRoleChange(email: string, role: Role) {
    try {
      await updateAdminRole(email, role)
      await loadAdmins()
    } catch (err) {
      setError(String(err))
    }
  }

  async function handleRemove(email: string) {
    if (email === user?.email) {
      setError("You can't remove yourself")
      return
    }
    if (!confirm(`Remove ${email} from admin access?`)) return
    try {
      await removeAdmin(email)
      await loadAdmins()
    } catch (err) {
      setError(String(err))
    }
  }

  const canManage = permissions?.canManageUsers

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-white">Settings</h1>
          <p className="text-text-light/50 text-sm mt-1">Manage team access and roles</p>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="bg-space-deep/50 border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-primary" />
            <h2 className="font-display text-lg text-white">Team Members</h2>
            <span className="text-xs text-text-light/40 bg-white/5 px-2 py-0.5 rounded-full">
              {admins.length}
            </span>
          </div>
          {canManage && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 text-sm text-blue-primary hover:text-white bg-blue-primary/10 hover:bg-blue-primary/20 px-3 py-1.5 rounded-lg transition"
            >
              <UserPlus className="w-4 h-4" />
              Add Member
            </button>
          )}
        </div>

        {/* Add Member Form */}
        {showAddForm && canManage && (
          <form onSubmit={handleAddAdmin} className="px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@example.com"
                  required
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Full name"
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 placeholder:text-text-light/30 focus:outline-none focus:border-blue-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-text-light/50 mb-1">Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as Role)}
                  className="w-full bg-space-deep/50 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-blue-primary/50 appearance-none"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r} className="bg-space-deep">
                      {ROLE_LABELS[r].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-deep text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-blue-deep/80 disabled:opacity-50 transition"
              >
                {saving ? "Adding..." : "Add Member"}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-sm text-text-light/50 hover:text-white transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Error */}
        {error && (
          <div className="px-6 py-3 bg-red-500/10 text-red-400 text-sm border-b border-white/10">
            {error}
            <button onClick={() => setError("")} className="ml-2 underline">dismiss</button>
          </div>
        )}

        {/* Member List */}
        {loading ? (
          <div className="px-6 py-12 text-center text-text-light/40">Loading...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {admins.map((admin) => {
              const roleInfo = ROLE_LABELS[admin.role]
              const RoleIcon = roleInfo.icon
              const isCurrentUser = admin.email === user?.email

              return (
                <div
                  key={admin.email}
                  className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-primary to-emerald flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {(admin.name || admin.email).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-medium truncate">
                          {admin.name || admin.email.split("@")[0]}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] text-text-light/30 bg-white/5 px-1.5 py-0.5 rounded">you</span>
                        )}
                      </div>
                      <span className="text-xs text-text-light/40 truncate block">
                        {admin.email}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    {canManage && !isCurrentUser ? (
                      <select
                        value={admin.role}
                        onChange={(e) => handleRoleChange(admin.email, e.target.value as Role)}
                        className="bg-space-deep/50 border border-white/10 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-primary/50 appearance-none"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r} className="bg-space-deep">
                            {ROLE_LABELS[r].label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full ${roleInfo.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleInfo.label}
                      </span>
                    )}

                    {canManage && !isCurrentUser && (
                      <button
                        onClick={() => handleRemove(admin.email)}
                        className="text-red-400/40 hover:text-red-400 transition p-1"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Role Permissions Reference */}
      <div className="mt-8 bg-space-deep/50 border border-white/10 rounded-2xl p-6">
        <h3 className="font-display text-sm text-white mb-4">Role Permissions</h3>
        <div className="grid grid-cols-5 gap-2 text-xs">
          <div className="text-text-light/40" />
          <div className="text-center text-text-light/60 font-medium">Edit</div>
          <div className="text-center text-text-light/60 font-medium">Publish</div>
          <div className="text-center text-text-light/60 font-medium">Delete</div>
          <div className="text-center text-text-light/60 font-medium">Manage Users</div>
          {ROLE_OPTIONS.map((r) => {
            const info = ROLE_LABELS[r]
            return (
              <div key={r} className="contents">
                <div className={`flex items-center gap-1 ${info.color} px-2 py-1.5 rounded-lg`}>
                  {info.label}
                </div>
                <div className="text-center py-1.5">{r !== "viewer" ? "✓" : "—"}</div>
                <div className="text-center py-1.5">{r === "superadmin" || r === "admin" ? "✓" : "—"}</div>
                <div className="text-center py-1.5">{r === "superadmin" || r === "admin" ? "✓" : "—"}</div>
                <div className="text-center py-1.5">{r === "superadmin" ? "✓" : "—"}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
