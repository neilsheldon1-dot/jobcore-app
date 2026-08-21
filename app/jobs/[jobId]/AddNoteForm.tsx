'use client'

import { useState } from 'react'

export default function AddNoteForm({ jobId }: { jobId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [content, setContent] = useState('')
  const [internalOnly, setInternalOnly] = useState(true)
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
        internal_only: internalOnly,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result.error, null, 2))
      setLoading(false)
      return
    }

    setContent('')
    setInternalOnly(true)
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
        + Add Job Update
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Add Job Update
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
                  Who should see this?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInternalOnly(true)}
                    className={`border rounded-xl px-4 py-3 text-left transition ${
                      internalOnly
                        ? 'bg-amber-50 border-amber-300 text-amber-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-bold">
                      Internal only
                    </p>

                    <p className="text-xs">
                      Office use only
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInternalOnly(false)}
                    className={`border rounded-xl px-4 py-3 text-left transition ${
                      !internalOnly
                        ? 'bg-green-50 border-green-300 text-green-800'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <p className="text-sm font-bold">
                      Share with site team
                    </p>

                    <p className="text-xs">
                      Visible to fitters and office staff
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Update
                </label>

                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add job information..."
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
                  {loading ? 'Saving...' : 'Save Update'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}