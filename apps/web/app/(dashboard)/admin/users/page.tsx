'use client'
import React, { useEffect, useState } from 'react'
import ErrorBoundary from '@/components/ErrorBoundary'
import type { AuthUser } from '@chainproof/types'

const ROLES = ['OFFICER', 'REGISTRAR', 'AUDITOR', 'ADMIN']

function CreateUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    employeeId: '', name: '', email: '', password: '',
    role: 'OFFICER', department: '', badgeNumber: '', phone: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        onCreated()
        onClose()
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to create user')
      }
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg card border-line shadow-void max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-white">Create New User</h2>
          <button onClick={onClose} className="text-neutral-500 hover:text-white text-xl leading-none">&times;</button>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Employee ID</label>
              <input className="input" required value={form.employeeId} placeholder="OFF-001"
                onChange={e => setForm({ ...form, employeeId: e.target.value })} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="select" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Full Name</label>
            <input className="input" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" required minLength={8} value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input className="input" required value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="label">Badge Number</label>
              <input className="input" value={form.badgeNumber}
                onChange={e => setForm({ ...form, badgeNumber: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Phone (optional)</label>
            <input className="input" type="tel" value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState('')

  const fetchUsers = () => {
    setLoading(true)
    fetch('/api/admin/users').then(r => r.json()).then(d => {
      if (d.data) setUsers(d.data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const toggleActive = async (userId: string, isActive: boolean) => {
    setError('')
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Failed to update user status')
      }
    } catch {
      setError('Network error')
    }
    fetchUsers()
  }

  const roleColor: Record<string, string> = {
    ADMIN: 'badge-red',
    OFFICER: 'badge-blue',
    REGISTRAR: 'badge-purple',
    AUDITOR: 'badge-green'
  }

  return (
    <ErrorBoundary>
      {showModal && <CreateUserModal onClose={() => setShowModal(false)} onCreated={fetchUsers} />}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="page-title">User Management</h1>
            <p className="page-subtitle">Administer system users and roles</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ Create User</button>
        </div>
        {error && (
          <div role="alert" className="border border-[#FF2626]/60 bg-red-950/30 px-4 py-3 text-sm text-[#FF3B3B]">{error}</div>
        )}
        <div className="table-container">
          <table className="min-w-full">
            <thead className="table-head">
              <tr>
                <th className="table-th">Name</th>
                <th className="table-th">Employee ID</th>
                <th className="table-th">Role</th>
                <th className="table-th">Department</th>
                <th className="table-th">Badge</th>
                <th className="table-th">Status</th>
                <th className="table-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-12 text-neutral-500 animate-pulse">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-td text-center py-12 text-neutral-400">No users found.</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="table-td text-white font-medium">{u.name}</td>
                  <td className="table-td font-mono text-xs text-neutral-400">{u.employeeId}</td>
                  <td className="table-td">
                    <span className={`badge ${roleColor[u.role] || 'badge-gray'}`}>{u.role}</span>
                  </td>
                  <td className="table-td text-neutral-400">{u.department}</td>
                  <td className="table-td text-neutral-500 font-mono text-xs">{u.badgeNumber || '—'}</td>
                  <td className="table-td">
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="table-td text-right">
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={`text-xs font-semibold transition-colors ${
                        u.isActive ? 'text-brand-400 hover:text-brand-300' : 'text-green-400 hover:text-green-300'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ErrorBoundary>
  )
}
