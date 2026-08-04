'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'

type WorkInProgressStepProps = {
  onComplete: () => void
  onCannotComplete: () => void
}

export default function WorkInProgressStep({
  onComplete,
  onCannotComplete,
}: WorkInProgressStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={3}
        totalSteps={7}
        label="Work in Progress"
      />

      <p className="text-sm leading-6 text-slate-600">
        Carry out the required work. Return here when the work is
        finished or if all planned work cannot be completed.
      </p>

      <div className="mt-6 space-y-3">
        <PrimaryButton onClick={onComplete}>
          Work Completed
        </PrimaryButton>

        <button
          type="button"
          onClick={onCannotComplete}
          className="w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 font-bold text-amber-800 transition hover:bg-amber-100"
        >
          Cannot Fully Complete
        </button>
      </div>
    </MobileCard>
  )
}