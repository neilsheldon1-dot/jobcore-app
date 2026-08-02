'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CANNOT_START_REASONS } from '../../../../../lib/cannotStartReasons'

type CannotStartReasonStepProps = {
  jobId: string
  recordId: string
  initialReasons?: string[]
}



export default function CannotStartReasonStep({
  jobId,
  recordId,
  initialReasons = [],
}: CannotStartReasonStepProps) {
  const router = useRouter()

  const [selectedReasons, setSelectedReasons] =
    useState<string[]>(initialReasons)

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function toggleReason(code: string) {
    setSelectedReasons((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    )
  }

  async function saveReasons() {
    if (selectedReasons.length === 0) {
      setError('Please select at least one reason.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/cannot-start-reasons',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId,
            reasons: selectedReasons,
          }),
        }
      )

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(text)

        throw new Error(
          `Save endpoint returned HTTP ${response.status}`
        )
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to save reasons.'
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
          : 'Unable to save reasons.'
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
        Reason work can't start today
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Select all that apply.
      </p>

      <div className="mt-6 grid gap-3">
        {CANNOT_START_REASONS.map((reason) => {
          const selected =
            selectedReasons.includes(reason.code)

          return (
            <button
              key={reason.code}
              type="button"
              onClick={() => toggleReason(reason.code)}
              className={`rounded-xl border-2 p-5 text-left transition ${
                selected
                  ? reason.selected
                  : `border-slate-200 ${reason.hover}`
              }`}
            >
              <p className="font-bold text-slate-900">
                {reason.label}
              </p>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={saveReasons}
          disabled={saving}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : 'Save and Continue →'}
        </button>
      </div>
    </section>
  )
}