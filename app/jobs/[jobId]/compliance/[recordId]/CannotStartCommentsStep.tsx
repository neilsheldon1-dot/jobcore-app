'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type CannotStartCommentsStepProps = {
  jobId: string
  recordId: string
  initialComments?: string
}

export default function CannotStartCommentsStep({
  jobId,
  recordId,
  initialComments = '',
}: CannotStartCommentsStepProps) {
  const router = useRouter()

  const [comments, setComments] = useState(initialComments)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function saveComments() {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/cannot-start-comments',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId,
            comments,
          }),
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error('Unexpected API response:', text)

        throw new Error(
          `Save endpoint returned HTTP ${response.status} instead of JSON`
        )
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to save comments.'
        )
      }

      router.push(
        `/jobs/${jobId}/compliance/${recordId}?step=${result.nextStep}`
      )

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save comments.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Cannot Start
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Additional comments
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Add anything the office needs to know.
      </p>

      <div className="mt-6">
        <label
          htmlFor="cannot-start-comments"
          className="text-sm font-bold text-slate-700"
        >
          Comments
        </label>

        <textarea
          id="cannot-start-comments"
          value={comments}
          onChange={(event) => setComments(event.target.value)}
          placeholder="Add any useful site information..."
          rows={7}
          className="mt-2 w-full resize-y rounded-xl border-2 border-slate-200 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500"
        />

        <p className="mt-2 text-xs text-slate-400">
          Optional
        </p>
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/jobs/${jobId}/compliance/${recordId}?step=cannot_start`
            )
          }
          disabled={saving}
          className="text-sm font-bold text-blue-600 disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={saveComments}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save and Continue →'}
        </button>
      </div>
    </section>
  )
}