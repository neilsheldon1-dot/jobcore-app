'use client'

import { useState } from 'react'

export default function EditableNote({
  note,
  canEdit,
}: {
  note: any
  canEdit: boolean
}) {
  const [editing, setEditing] = useState(false)
  const [content, setContent] = useState(note.content || '')

  async function saveNote() {
    const response = await fetch('/api/update-note', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        note_id: note.id,
        content,
      }),
    })

    if (!response.ok) {
      alert('Failed to update note')
      return
    }

    setEditing(false)
  }

  if (editing) {
    return (
      <div className="mt-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm"
        />

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={saveNote}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => {
              setContent(note.content || '')
              setEditing(false)
            }}
            className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="text-slate-700 whitespace-pre-wrap mt-1">
        {content}
      </p>

      {canEdit && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 mt-2"
        >
          Edit Note
        </button>
      )}
    </>
  )
}