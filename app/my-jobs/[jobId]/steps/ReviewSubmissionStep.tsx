'use client'

import MobileCard from '../../../../components/app/MobileCard'
import PrimaryButton from '../../../../components/app/PrimaryButton'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'

type WorkflowPhoto = {
  id: string
  file_url: string
}

type ReviewSubmissionStepProps = {
  beforePhotos: WorkflowPhoto[]
  afterPhotos: WorkflowPhoto[]
  additionalInformation: string
  onAdditionalInformationChange: (value: string) => void
  onContinue: () => void
}

export default function ReviewSubmissionStep({
  beforePhotos,
  afterPhotos,
  additionalInformation,
  onAdditionalInformationChange,
  onContinue,
}: ReviewSubmissionStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={5}
        totalSteps={7}
        label="Review"
      />
<h2 className="text-lg font-bold text-slate-900">
  Review Submission
</h2>
      <p className="text-sm text-slate-500">
        Review the job before signing and submitting it to the office.
      </p>

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-900">
            Before Photos
          </p>

          <span className="text-sm font-bold text-slate-500">
            {beforePhotos.length}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {beforePhotos.slice(0, 4).map((photo) => (
            <img
              key={photo.id}
              src={photo.file_url}
              alt="Before work"
              className="h-16 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between">
          <p className="font-bold text-slate-900">
            After Photos
          </p>

          <span className="text-sm font-bold text-slate-500">
            {afterPhotos.length}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-2">
          {afterPhotos.slice(0, 4).map((photo) => (
            <img
              key={photo.id}
              src={photo.file_url}
              alt="Completed work"
              className="h-16 w-full rounded-lg object-cover"
            />
          ))}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-200 pt-5">
       <p className="font-bold text-slate-900">
  Work Carried Out
</p>

<p className="mt-1 text-sm text-slate-500">
  Describe the work completed today. This will be used for the completion report and invoice.
</p>

<textarea
  rows={5}
  value={additionalInformation}
  onChange={(event) =>
    onAdditionalInformationChange(
      event.target.value
    )
  }
  placeholder="Type here..."
          className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-orange-500 focus:outline-none"
        />
      </div>

      <div className="mt-6">
        <PrimaryButton onClick={onContinue}>
          Continue to Signature
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}