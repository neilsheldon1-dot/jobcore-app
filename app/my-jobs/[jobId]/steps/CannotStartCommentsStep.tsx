'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'

type CannotStartCommentsStepProps = {
  comments: string
  onCommentsChange: (comments: string) => void
  onContinue: () => void
}

export default function CannotStartCommentsStep({
  comments,
  onCommentsChange,
  onContinue,
}: CannotStartCommentsStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={2}
        totalSteps={5}
        label="Comments"
      />

      <p className="text-sm text-slate-500">
        If there&apos;s anything else the office should know,
        add it below.
      </p>

      <textarea
        rows={6}
        value={comments}
        onChange={(event) =>
          onCommentsChange(event.target.value)
        }
        placeholder="[Optional] Type here..."
        className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
      />

      <div className="mt-6">
        <PrimaryButton onClick={onContinue}>
          Continue
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}