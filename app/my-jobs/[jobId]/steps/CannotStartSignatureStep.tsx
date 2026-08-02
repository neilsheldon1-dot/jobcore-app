'use client'

import MobileCard from '../../../../components/app/MobileCard'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'
import SignaturePad from '../../../../components/app/SignaturePad'

type CannotStartSignatureStepProps = {
  jobId: string
  recordId: string
  onBack: () => void
  onComplete: () => void
}

export default function CannotStartSignatureStep({
  jobId,
  recordId,
  onBack,
  onComplete,
}: CannotStartSignatureStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={4}
        totalSteps={5}
        label="Signature"
      />

      <SignaturePad
        jobId={jobId}
        recordId={recordId}
        onBack={onBack}
        onComplete={onComplete}
      />
    </MobileCard>
  )
}