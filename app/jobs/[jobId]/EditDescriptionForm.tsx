'use client'

import { useState } from 'react'
import CopyButton from '../../../components/CopyButton'

export default function EditDescriptionForm({
  jobId,
  currentDescription,
}: {
  jobId: string
  currentDescription: string | null
}) {
  const [editing, setEditing] = useState(false)
  const [description, setDescription] = useState(currentDescription || '')
  const [saving, setSaving] = useState(false)

  async function saveDescription() {
    setSaving(true)

    const response = await fetch('/api/update-job-description', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        description,
      }),
    })

    setSaving(false)

    if (!response.ok) {
      alert('Failed to update work description')
      return
    }

    setEditing(false)
  }

  if (!editing) {
    return (
      <div>
        <div className="flex items-start gap-2">
  <p className="text-slate-700 whitespace-pre-wrap break-words flex-1">
    {description || 'No work description added'}
  </p>

  {description && (
    <CopyButton value={description} />
  )}
</div>

        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-3 text-sm font-semibold text-blue-600 hover:text-blue-700"
        >
          Edit Description
        </button>
      </div>
    )
  }

  return (
    <div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={5}
        className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={saveDescription}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>

        <button
          type="button"
          onClick={() => {
            setDescription(currentDescription || '')
            setEditing(false)
          }}
          className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}