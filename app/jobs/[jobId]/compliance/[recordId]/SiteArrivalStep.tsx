'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type SiteArrivalStepProps = {
  jobId: string
  recordId: string
  initialAnswer: boolean | null
}

export default function SiteArrivalStep({
  jobId,
  recordId,
  initialAnswer,
}: SiteArrivalStepProps) {
  const router = useRouter()

  const [answer, setAnswer] = useState<boolean | null>(
    initialAnswer
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function saveAnswer() {
    if (answer === null) {
      setError('Please select whether the job can be started.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/compliance/site-arrival', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    recordId,
    jobId,
    canStart: answer,
  }),
})

      const contentType = response.headers.get('content-type') || ''

if (!contentType.includes('application/json')) {
  const responseText = await response.text()

  console.error('Unexpected API response:', responseText)

  throw new Error(
    `Save endpoint returned HTTP ${response.status} instead of JSON`
  )
}

const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Unable to save answer')
      }

      router.push(
  `/jobs/${jobId}/compliance/${recordId}?step=${result.nextStep}`
)
router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save answer'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Site Arrival
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Can the job be started today?
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Select the option that reflects the current site situation.
      </p>

      <div className="mt-6 grid gap-3">
        <button
          type="button"
          onClick={() => setAnswer(true)}
          className={`rounded-xl border-2 p-5 text-left transition ${
            answer === true
              ? 'border-green-500 bg-green-50'
              : 'border-slate-200 hover:border-green-300'
          }`}
        >
          <p className="font-bold text-slate-900">
            Job CAN be started
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Continue to RAMS acceptance.
          </p>
        </button>

        <button
          type="button"
          onClick={() => setAnswer(false)}
          className={`rounded-xl border-2 p-5 text-left transition ${
            answer === false
              ? 'border-red-500 bg-red-50'
              : 'border-slate-200 hover:border-red-300'
          }`}
        >
          <p className="font-bold text-slate-900">
            Job CAN&apos;T be started
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Record the reason, comments and supporting photos.
          </p>
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveAnswer}
          disabled={saving || answer === null}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save and Continue →'}
        </button>
      </div>
    </section>
  )
}