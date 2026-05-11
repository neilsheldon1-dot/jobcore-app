'use client'

import { useState } from 'react'

export default function AddNoteForm({
  jobId,
}: {
  jobId: string
}) {
  const [content, setContent] = useState('')
  const [createdBy, setCreatedBy] = useState('Neil')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setLoading(true)

    const response = await fetch('/api/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        content,
        created_by: createdBy,
      }),
    })

    const result = await response.json()

    console.log('NOTE RESULT:', result)

    if (!response.ok) {
      alert(JSON.stringify(result.error, null, 2))
      setLoading(false)
      return
    }

    setContent('')
    setLoading(false)

    window.location.reload()
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-300 rounded-3xl shadow-lg p-8 mt-8"
    >
      <h2 className="text-black text-2xl font-bold mb-4">
        Add Note
      </h2>

      <input
        value={createdBy}
        onChange={(e) => setCreatedBy(e.target.value)}
        placeholder="Your name"
        className="bg-white w-full border rounded-xl p-4 mb-4"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add job update..."
        className="bg-white w-full border rounded-xl p-4 min-h-[120px]"
      />

      <button
        type="submit"
        disabled={loading}
        className="mt-4 bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
      >
        {loading ? 'Saving...' : 'Save Note'}
      </button>
    </form>
  )
}