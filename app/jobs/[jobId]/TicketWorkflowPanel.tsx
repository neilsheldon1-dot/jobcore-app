'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type WorkflowAnswers = {
  cannotStartReasons?: string[]
  cannotStartComments?: string
  cannotStartSignature?: string
  cannotStartPhotos?: unknown[]
  completionNotes?: string
completionSignature?: string
ramsConfirmed?: boolean
  photoIds?: unknown[]
  photos?: unknown[]
  [key: string]: unknown
}

type TicketWorkflowPanelProps = {
  jobId: string
  record: {
    id: string
    status: string
    started_at: string | null
    accepted_at: string | null
    completed_at: string | null
    signed_by: string | null
    operative_id: string | null
    answers?: WorkflowAnswers | null
  } | null
}

const statusStyles: Record<string, string> = {
  draft: 'border-slate-200 bg-slate-100 text-slate-700',
  in_progress: 'border-amber-200 bg-amber-100 text-amber-800',
  accepted: 'border-purple-200 bg-purple-100 text-purple-800',
  not_started: 'border-red-200 bg-red-100 text-red-800',
  started_not_completed:
    'border-orange-200 bg-orange-100 text-orange-800',
  completed: 'border-green-200 bg-green-100 text-green-800',
  cancelled: 'border-slate-200 bg-slate-100 text-slate-500',
}

const statusLabels: Record<string, string> = {
  draft: 'Not Started',
  in_progress: 'On Site',
  accepted: 'Working',
  not_started: 'Cannot Start',
  started_not_completed: 'Not Completed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function formatReason(reason: string) {
  return reason
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase())
}

function getPhotoCount(answers: WorkflowAnswers) {
  const possiblePhotoCollections = [
    answers.cannotStartPhotos,
    answers.photoIds,
    answers.photos,
  ]

  for (const collection of possiblePhotoCollections) {
    if (Array.isArray(collection)) {
      return collection.length
    }
  }

  return 0
}

export default function TicketWorkflowPanel({
  jobId,
  record,
}: TicketWorkflowPanelProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  async function startWorkflow() {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/compliance/start-ticket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error || 'Unable to start Ticket workflow.'
        )
      }

      router.push(
        `/jobs/${jobId}/compliance/${result.record.id}`
      )

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start Ticket workflow.'
      )
    } finally {
      setLoading(false)
    }
  }

  function continueWorkflow() {
    if (!record) {
      return
    }

    router.push(`/jobs/${jobId}/compliance/${record.id}`)
  }

  async function deleteWorkflow() {
    if (!record) {
      return
    }

    const confirmed = window.confirm(
      'Delete this Ticket Workflow record and start again?\n\nThis will delete the workflow answers and signature. It will not delete the job.'
    )

    if (!confirmed) {
      return
    }

    setDeleting(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/delete-ticket',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId: record.id,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error || 'Unable to delete Ticket workflow.'
        )
      }

      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete Ticket workflow.'
      )
    } finally {
      setDeleting(false)
    }
  }

  const status = record?.status || 'draft'

  const badgeStyle =
    statusStyles[status] || statusStyles.draft

  const statusLabel =
    statusLabels[status] || status

  const hasCompleted =
    status === 'completed' ||
    status === 'not_started' ||
    Boolean(record?.completed_at)

  const answers =
    record?.answers &&
    typeof record.answers === 'object' &&
    !Array.isArray(record.answers)
      ? record.answers
      : {}

  const cannotStartReasons = Array.isArray(
    answers.cannotStartReasons
  )
    ? answers.cannotStartReasons.filter(
        (reason): reason is string =>
          typeof reason === 'string' && reason.trim().length > 0
      )
    : []

  const cannotStartComments =
    typeof answers.cannotStartComments === 'string'
      ? answers.cannotStartComments.trim()
      : ''

  const hasSignature =
    typeof answers.cannotStartSignature === 'string' &&
    answers.cannotStartSignature.length > 0

    const completionNotes =
  typeof answers.completionNotes === 'string'
    ? answers.completionNotes.trim()
    : ''

const hasCompletionSignature =
  typeof answers.completionSignature === 'string' &&
  answers.completionSignature.length > 0

const ramsConfirmed =
  answers.ramsConfirmed === true

  const photoCount = getPhotoCount(answers)

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-bold text-slate-900">
            Reactive Roofing Ticket
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Site workflow, RAMS, work record and completion
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badgeStyle}`}
        >
          <span className="mr-2 h-2 w-2 rounded-full bg-current" />

          {statusLabel}
        </span>
      </div>

      {record && (
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Started
            </p>

            <p className="font-semibold text-slate-700">
              {record.started_at
                ? new Date(
                    record.started_at
                  ).toLocaleString('en-GB')
                : 'Not recorded'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              RAMS Accepted
            </p>

            <p className="font-semibold text-slate-700">
              {record.accepted_at
                ? new Date(
                    record.accepted_at
                  ).toLocaleString('en-GB')
                : 'Not applicable'}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Completed
            </p>

            <p className="font-semibold text-slate-700">
              {record.completed_at
                ? new Date(
                    record.completed_at
                  ).toLocaleString('en-GB')
                : hasCompleted
                  ? 'Submitted'
                  : 'Not yet'}
            </p>
          </div>
        </div>
      )}

      {record && status === 'not_started' && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-bold text-red-800">
            Work could not be started
          </p>

          {cannotStartReasons.length > 0 && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">
                Reasons
              </p>

              <ul className="mt-2 space-y-1 text-sm font-semibold text-red-800">
                {cannotStartReasons.map(reason => (
                  <li
                    key={reason}
                    className="flex items-start gap-2"
                  >
                    <span className="mt-[2px]">•</span>

                    <span>{formatReason(reason)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {cannotStartComments && (
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">
                Comments
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm text-red-800">
                {cannotStartComments}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-red-200 pt-3 text-sm font-semibold text-red-800">
            <span>
              {hasSignature
                ? '✓ Signature captured'
                : 'Signature not captured'}
            </span>

            <span>
              {photoCount === 0
                ? 'No photos attached'
                : `${photoCount} ${
                    photoCount === 1 ? 'photo' : 'photos'
                  } attached`}
            </span>
          </div>
        </div>
      )}

      {record && status === 'completed' && (
  <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
    <p className="font-bold text-green-800">
      Job completed
    </p>

    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
          RAMS
        </p>

        <p className="mt-1 text-sm font-semibold text-green-800">
          {ramsConfirmed
            ? '✓ Confirmed in Dashpivot'
            : 'Not recorded'}
        </p>
      </div>

      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
          Signature
        </p>

        <p className="mt-1 text-sm font-semibold text-green-800">
          {hasCompletionSignature
            ? '✓ Signature captured'
            : 'Signature not captured'}
        </p>
      </div>
    </div>

    <div className="mt-4 border-t border-green-200 pt-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
        Work Carried Out
      </p>

      <p className="mt-1 whitespace-pre-wrap text-sm text-green-800">
        {completionNotes || 'No additional information added'}
      </p>
    </div>
  </div>
)}

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!record ? (
          <button
            type="button"
            onClick={startWorkflow}
            disabled={loading}
            className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading
              ? 'Starting...'
              : 'Start Ticket Workflow'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={continueWorkflow}
              disabled={deleting}
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasCompleted
                ? 'Open Workflow'
                : 'Continue Ticket Workflow'}
            </button>

            <button
              type="button"
              onClick={deleteWorkflow}
              disabled={deleting}
              className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleting
                ? 'Deleting...'
                : 'Delete and Start Again'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}