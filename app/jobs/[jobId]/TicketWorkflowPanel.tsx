'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

type WorkflowAnswers = {
  cannotStartReasons?: string[]
  cannotStartComments?: string
  cannotStartSignature?: string
  completionNotes?: string
  completionSignature?: string
  ramsConfirmed?: boolean
  [key: string]: unknown
}

type TicketWorkflowPanelProps = {
  jobId: string
  operativeName: string | null
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

export default function TicketWorkflowPanel({
  jobId,
  operativeName,
  record,
}: TicketWorkflowPanelProps) {

    const router = useRouter()
const [deleting, setDeleting] = useState(false)
const [error, setError] = useState('')

  if (!record) {
    return null
  }

  const status = record.status || 'draft'

  const badgeStyle =
    statusStyles[status] || statusStyles.draft

  const statusLabel =
    statusLabels[status] || status

  const answers =
    record.answers &&
    typeof record.answers === 'object' &&
    !Array.isArray(record.answers)
      ? record.answers
      : {}

  const cannotStartReasons = Array.isArray(
    answers.cannotStartReasons
  )
    ? answers.cannotStartReasons.filter(
        (reason): reason is string =>
          typeof reason === 'string' &&
          reason.trim().length > 0
      )
    : []

  const cannotStartComments =
    typeof answers.cannotStartComments === 'string'
      ? answers.cannotStartComments.trim()
      : ''

  const hasCannotStartSignature =
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

  const reportTitle =
    status === 'completed'
      ? 'Work Completed'
      : status === 'not_started'
        ? 'Work Could Not Be Started'
        : status === 'started_not_completed'
          ? 'Work Started But Not Completed'
          : 'Site Visit'

          async function deleteWorkflow() {
  if (!record) return

  const confirmed = window.confirm(
    'Delete this Site Report and reset the job?\n\nThis is intended for testing and corrections.'
  )

  if (!confirmed) return

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
        result?.error || 'Unable to delete the Site Report.'
      )
    }

    window.location.reload()
  } catch (deleteError) {
    setError(
      deleteError instanceof Error
        ? deleteError.message
        : 'Unable to delete the Site Report.'
    )
  } finally {
    setDeleting(false)
  }
}

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="font-bold text-slate-900">
          {reportTitle}
        </p>

        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badgeStyle}`}
        >
          <span className="mr-2 h-2 w-2 rounded-full bg-current" />
          {statusLabel}
        </span>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Job Accepted
          </p>

          <p className="font-semibold text-slate-700">
            {record.started_at
              ? new Date(record.started_at).toLocaleString(
                  'en-GB'
                )
              : 'Not recorded'}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            RAMS Completed
          </p>

          <p className="font-semibold text-slate-700">
            {record.accepted_at
              ? new Date(record.accepted_at).toLocaleString(
                  'en-GB'
                )
              : 'Not applicable'}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
            Submitted
          </p>

          <p className="font-semibold text-slate-700">
            {record.completed_at
              ? new Date(record.completed_at).toLocaleString(
                  'en-GB'
                )
              : 'Not yet'}
          </p>
        </div>
      </div>

      {status === 'not_started' && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          {cannotStartReasons.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">
                Reasons Reported
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

          {hasCannotStartSignature && (
            <div className="mt-4 border-t border-red-200 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">
                Signed By
              </p>

              <p className="mb-3 mt-1 font-semibold text-slate-800">
                {operativeName || 'Operative'}
              </p>

              <img
                src={
                  answers.cannotStartSignature as string
                }
                alt={`Signature of ${
                  operativeName || 'operative'
                }`}
                className="h-20 rounded-lg border border-red-200 bg-white p-2"
              />
            </div>
          )}
        </div>
      )}

      {status === 'completed' && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
                Signed By
              </p>

              <p className="mb-3 mt-1 font-semibold text-green-900">
                {operativeName || 'Operative'}
              </p>

              {hasCompletionSignature ? (
                <img
                  src={
                    answers.completionSignature as string
                  }
                  alt={`Signature of ${
                    operativeName || 'operative'
                  }`}
                  className="h-20 rounded-lg border border-green-200 bg-white p-2"
                />
              ) : (
                <p className="text-sm text-green-800">
                  No signature recorded
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 border-t border-green-200 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-green-600">
              Work Completed
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-green-800">
              {completionNotes ||
                'No work summary recorded'}
            </p>
          </div>
        </div>
      )}
      {error && (
  <p className="mt-4 text-sm font-semibold text-red-600">
    {error}
  </p>
)}

<div className="mt-4">
  <button
    type="button"
    onClick={deleteWorkflow}
    disabled={deleting}
    className="rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
  >
    {deleting ? 'Deleting...' : 'Delete Test Report'}
  </button>
</div>
    </div>
  )
}