'use client'

import MobileCard from '../../../../components/app/MobileCard'

type CanCompleteStepProps = {
  saving: boolean
  error: string
  onAnswer: (canComplete: boolean) => void
}

export default function CanCompleteStep({
  saving,
  error,
  onAnswer,
}: CanCompleteStepProps) {
  return (
    <MobileCard>
      <p className="mb-2 text-base font-bold text-slate-700">
        Can All Planned Work Be Completed?
      </p>

      <p className="text-sm leading-6 text-slate-500">
        You can still continue with any work that can be completed safely.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onAnswer(true)}
          disabled={saving}
          className="rounded-xl bg-green-600 px-4 py-4 font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
        >
          Yes
        </button>

        <button
          type="button"
          onClick={() => onAnswer(false)}
          disabled={saving}
          className="rounded-xl bg-amber-500 px-4 py-4 font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
        >
          No
        </button>
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </MobileCard>
  )
}