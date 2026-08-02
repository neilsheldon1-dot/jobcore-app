'use client'

import MobileCard from '../../../../components/app/MobileCard'


type CanStartStepProps = {
  saving: boolean
  error: string
  onAnswer: (canStart: boolean) => void
}

export default function CanStartStep({
  saving,
  error,
  onAnswer,
}: CanStartStepProps) {
  return (
    <MobileCard>
     <p className="mb-4 text-base font-bold text-slate-700">
  Can Work Start Today?
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
          className="rounded-xl bg-red-600 px-4 py-4 font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
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