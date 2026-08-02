'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'

type WorkInProgressStepProps = {
  onComplete: () => void
}

export default function WorkInProgressStep({
  onComplete,
}: WorkInProgressStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={3}
        totalSteps={6}
        label="Work in Progress"
      />

      <p className="text-sm leading-6 text-slate-600">
        Carry out the required work. Return here when finished.
      </p>

      <div className="mt-6">
        <PrimaryButton onClick={onComplete}>
          Work Completed
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}