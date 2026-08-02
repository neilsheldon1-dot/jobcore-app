'use client'

import { useState } from 'react'

type Operative = {
  id: string
  display_name: string | null
  full_name: string | null
  email: string | null
}

export default function AssignedToDropdown({
  jobId,
  currentAssignedUserId,
  operatives,
}: {
  jobId: string
  currentAssignedUserId: string | null
  operatives: Operative[]
}) {
  const [assignedUserId, setAssignedUserId] = useState(
    currentAssignedUserId || ''
  )
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const currentOperative = operatives.find(
    (operative) => operative.id === assignedUserId
  )

  const currentName =
    currentOperative?.display_name ||
    currentOperative?.full_name ||
    currentOperative?.email ||
    'Unassigned'

  async function updateAssignee(value: string) {
    setSaving(true)

    try {
      const response = await fetch('/api/assign-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_id: jobId,
          assigned_user_id: value || null,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to update assignee')
        return
      }

      setAssignedUserId(value)
      setOpen(false)
    } catch (error: any) {
      alert(error.message || 'Failed to update assignee')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative mt-2">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-full bg-orange-500 border border-orange-600 px-3 py-1 text-sm font-bold text-white hover:bg-orange-600 transition cursor-pointer disabled:opacity-60"
      >
        👤 {saving ? 'Saving...' : currentName}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {operatives.map((operative) => {
            const name =
              operative.display_name ||
              operative.full_name ||
              operative.email ||
              'Unnamed'

            return (
              <button
                key={operative.id}
                type="button"
                onClick={() => updateAssignee(operative.id)}
                className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 hover:bg-orange-50 cursor-pointer"
              >
                {name}
              </button>
            )
          })}

          <button
            type="button"
            onClick={() => updateAssignee('')}
            className="block w-full border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-slate-500 hover:bg-slate-50 cursor-pointer"
          >
            Unassigned
          </button>
        </div>
      )}
    </div>
  )
}