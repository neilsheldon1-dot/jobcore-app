'use client'

import { useState } from 'react'

export default function AddNoteForm({
  jobId,
}: {
  jobId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
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

    if (!response.ok) {
      alert(JSON.stringify(result.error, null, 2))
      setLoading(false)
      return
    }

    setContent('')
    setLoading(false)
    setIsOpen(false)

    window.location.reload()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-5 py-1 rounded-xl font-bold hover:bg-blue-700 transition"
      >
        + Add New Note
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Add Note
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Added By
                </label>

                <input
                  value={createdBy}
                  onChange={(e) => setCreatedBy(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Note
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add job update..."
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-[140px]"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Note'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}