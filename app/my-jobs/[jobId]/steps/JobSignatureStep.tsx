'use client'

import MobileCard from '../../../../components/app/MobileCard'
import WorkflowProgress from '../../../../components/app/WorkflowProgress'
import SignaturePad from '../../../../components/app/SignaturePad'

type JobSignatureStepProps = {
  jobId: string
  recordId: string
  onBack: () => void
  onComplete: () => void
}

export default function JobSignatureStep({
  jobId,
  recordId,
  onBack,
  onComplete,
}: JobSignatureStepProps) {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={6}
        totalSteps={7}
        label="Signature"
      />

      <SignaturePad
  jobId={jobId}
  recordId={recordId}
  saveUrl="/api/compliance/completion-signature"
  onBack={onBack}
  onComplete={onComplete}
/>
    </MobileCard>
  )
}