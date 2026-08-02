'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'

type RamsStepProps = {
  confirmed: boolean
  onConfirmedChange: (confirmed: boolean) => void
  onContinue: () => void
}

export default function RamsStep({
  confirmed,
  onConfirmedChange,
  onContinue,
}: RamsStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={1}
        totalSteps={6}
        label="Before Work Begins"
      />

      <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-3">
        <p className="text-sm font-bold text-red-500">
          Complete and sign the RAMS in the Dashpivot app
          before work begins.
        </p>

        <p className="mt-1 text-sm text-slate-800">
          Once complete, return to JobCore and confirm below.
        </p>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(event) =>
            onConfirmedChange(event.target.checked)
          }
          className="mt-0.5 h-5 w-5 rounded border-slate-300 accent-orange-500"
        />

        <span className="text-sm font-semibold leading-6 text-slate-700">
          I confirm I have completed the RAMS in Dashpivot.
        </span>
      </label>

      <div className="mt-6">
        <PrimaryButton
          disabled={!confirmed}
          onClick={onContinue}
        >
          Begin Work
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}