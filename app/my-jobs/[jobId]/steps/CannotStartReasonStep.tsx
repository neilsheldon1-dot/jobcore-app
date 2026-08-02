'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'
import { CANNOT_START_REASONS } from '../../../../lib/cannotStartReasons'

type CannotStartReasonStepProps = {
  selectedReasons: string[]
  saving: boolean
  error: string
  onToggleReason: (code: string) => void
  onContinue: () => void
}

export default function CannotStartReasonStep({
  selectedReasons,
  saving,
  error,
  onToggleReason,
  onContinue,
}: CannotStartReasonStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={1}
        totalSteps={5}
        label="Cannot Start"
      />

      <p className="text-sm text-slate-500">
        Select all that apply.
      </p>

      <div className="mt-5 grid gap-3">
        {CANNOT_START_REASONS.map((reason) => {
          const selected = selectedReasons.includes(reason.code)

          return (
            <button
              key={reason.code}
              type="button"
              onClick={() => onToggleReason(reason.code)}
              className={`rounded-xl border-2 p-4 text-left transition ${
                selected
                  ? reason.selected
                  : `border-slate-200 ${reason.hover}`
              }`}
            >
              <span className="font-bold text-slate-900">
                {reason.label}
              </span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="mt-4 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-6">
        <PrimaryButton
          onClick={onContinue}
          disabled={saving || selectedReasons.length === 0}
        >
          {saving ? 'Saving...' : 'Continue'}
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}