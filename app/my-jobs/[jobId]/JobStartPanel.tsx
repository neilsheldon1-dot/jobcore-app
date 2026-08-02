'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PrimaryButton from '../../../components/app/PrimaryButton'
import MobileCard from '../../../components/app/MobileCard'
import WorkflowProgress from '../../../components/app/WorkflowProgress'
import { CANNOT_START_REASONS } from '../../../lib/cannotStartReasons'
import PhotoUploadForm from '../../jobs/[jobId]/PhotoUploadForm'
import SignaturePad from '../../../components/app/SignaturePad'
import AfterPhotosStep from './steps/AfterPhotosStep'
import WorkInProgressStep from './steps/WorkInProgressStep'
import BeforePhotosStep from './steps/BeforePhotosStep'
import RamsStep from './steps/RamsStep'
import CanStartStep from './steps/CanStartStep'
import ReviewJobStep from './steps/ReviewJobStep'
import CannotStartReasonStep from './steps/CannotStartReasonStep'
import CannotStartCommentsStep from './steps/CannotStartCommentsStep'
import CannotStartPhotosStep from './steps/CannotStartPhotosStep'
import CannotStartSignatureStep from './steps/CannotStartSignatureStep'
import ReviewSubmissionStep from './steps/ReviewSubmissionStep'
import JobSignatureStep from './steps/JobSignatureStep'

type WorkflowPhoto = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
  created_at?: string
  uploaded_by?: string | null
}

type Stage =
  | 'idle'
  | 'safety-check'
  | 'cannot-start'
  | 'cannot-start-comments'
  | 'dashpivot'
  | 'working'
  | 'cannot-start-photos'
  | 'cannot-start-signature'
  | 'cannot-start-complete'
  | 'work-in-progress'
  | 'after-photos'
  | 'review'
| 'signature'
| 'complete'

type JobStartPanelProps = {
  jobId: string
  jobAddress: string
}

export default function JobStartPanel({
  jobId,
  jobAddress,
}: JobStartPanelProps) {
  const router = useRouter()

  const [stage, setStage] = useState<Stage>('idle')
  const [workflowRecordId, setWorkflowRecordId] =
    useState<string | null>(null)
  const [selectedReasons, setSelectedReasons] =
    useState<string[]>([])
  const [ramsConfirmed, setRamsConfirmed] =
    useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [cannotStartPhotos, setCannotStartPhotos] =
  useState<WorkflowPhoto[]>([])
  const [beforePhotos, setBeforePhotos] =
  useState<WorkflowPhoto[]>([])
  const [afterPhotos, setAfterPhotos] =
  useState<WorkflowPhoto[]>([])
  const [cannotStartComments, setCannotStartComments] =
  useState('')
  const [completionNotes, setCompletionNotes] =
  useState('')

  async function handleCannotStartUpload(
  uploadedPhotos: WorkflowPhoto[]
) {
  if (!workflowRecordId) {
    throw new Error('Workflow record is missing.')
  }

  const photoIds = uploadedPhotos.map(
    (photo) => photo.id
  )

  const response = await fetch(
    '/api/compliance/cannot-start-photos',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jobId,
        recordId: workflowRecordId,
        photoIds,
      }),
    }
  )

  const result = await response.json()

  if (!response.ok) {
    throw new Error(
      result.error ||
        'Photos uploaded but could not be attached.'
    )
  }

  setCannotStartPhotos((current) => {
    const existingIds = new Set(
      current.map((photo) => photo.id)
    )

    return [
      ...current,
      ...uploadedPhotos.filter(
        (photo) => !existingIds.has(photo.id)
      ),
    ]
  })
}

function handleAfterPhotosUpload(
  uploadedPhotos: WorkflowPhoto[]
) {
  setAfterPhotos((current) => {
    const existingIds = new Set(
      current.map((photo) => photo.id)
    )

    return [
      ...current,
      ...uploadedPhotos.filter(
        (photo) => !existingIds.has(photo.id)
      ),
    ]
  })
}
function handleBeforePhotosUpload(
  uploadedPhotos: WorkflowPhoto[]
) {
  setBeforePhotos((current) => {
    const existingIds = new Set(
      current.map((photo) => photo.id)
    )

    return [
      ...current,
      ...uploadedPhotos.filter(
        (photo) => !existingIds.has(photo.id)
      ),
    ]
  })
}
  const progressDetails = {
    idle: {
      step: 1,
      label: 'Review Job',
    },
    'safety-check': {
      step: 2,
      label: 'Can Work Start Today?',
    },
    'cannot-start': {
      step: 2,
      label: 'Cannot Start',
    },
    'cannot-start-comments': {
  step: 3,
  label: 'Cannot Start Details',
},
    dashpivot: {
      step: 3,
      label: 'Before Work Begins',
    },
    working: {
      step: 4,
      label: 'Before Photos',
    },
    'cannot-start-photos': {
  step: 4,
  label: 'Photos',
},
'cannot-start-signature': {
  step: 5,
  label: 'Signature',
},
'work-in-progress': {
  step: 5,
  label: 'Work in Progress',
},
'cannot-start-complete': {
  step: 6,
  label: 'Complete',
},
'after-photos': {
  step: 6,
  label: 'After Photos',
},
  }

  const currentProgress = progressDetails[stage]

  async function startJob() {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/start-ticket',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ jobId }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.record?.id) {
        throw new Error(
          result.error || 'Unable to start the job workflow.'
        )
      }

      setWorkflowRecordId(result.record.id)
      setStage('safety-check')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to start the job workflow.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function saveSiteArrival(canStart: boolean) {
    if (!workflowRecordId) {
      setError('Workflow record is missing.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/site-arrival',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId: workflowRecordId,
            canStart,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to save the site decision.'
        )
      }

      setStage(canStart ? 'dashpivot' : 'cannot-start')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save the site decision.'
      )
    } finally {
      setSaving(false)
    }
  }

  function toggleReason(code: string) {
    setSelectedReasons((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code]
    )
  }

  async function saveCannotStartReasons() {
    if (!workflowRecordId) {
      setError('Workflow record is missing.')
      return
    }

    if (selectedReasons.length === 0) {
      setError('Please select at least one reason.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/cannot-start-reasons',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId: workflowRecordId,
            reasons: selectedReasons,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error || 'Unable to save the reasons.'
        )
      }

     setStage('cannot-start-comments')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save the reasons.'
      )
    } finally {
      setSaving(false)
    }
  }
async function saveCompletionNotes() {
  if (!workflowRecordId) {
    setError('Workflow record is missing.')
    return
  }

  setSaving(true)
  setError('')

  try {
    const response = await fetch(
      '/api/compliance/completion-notes',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          recordId: workflowRecordId,
          notes: completionNotes,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'Unable to save completion notes.'
      )
    }

    setStage('signature')
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to save completion notes.'
    )
  } finally {
    setSaving(false)
  }
}
async function confirmRams() {
  if (!workflowRecordId) {
    setError('Workflow record is missing.')
    return
  }

  setSaving(true)
  setError('')

  try {
    const response = await fetch(
      '/api/compliance/rams-confirmation',
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          recordId: workflowRecordId,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error || 'Unable to save RAMS confirmation.'
      )
    }

    setStage('working')
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : 'Unable to save RAMS confirmation.'
    )
  } finally {
    setSaving(false)
  }
}

  if (stage === 'idle') {
  return (
    <ReviewJobStep
      saving={saving}
      error={error}
      onSelect={startJob}
    />
  )
}

  if (stage === 'cannot-start') {
  return (
    <CannotStartReasonStep
      selectedReasons={selectedReasons}
      saving={saving}
      error={error}
      onToggleReason={toggleReason}
      onContinue={saveCannotStartReasons}
    />
  )
}
if (stage === 'cannot-start-comments') {
  return (
    <CannotStartCommentsStep
      comments={cannotStartComments}
      onCommentsChange={setCannotStartComments}
      onContinue={() => setStage('cannot-start-photos')}
    />
  )
}

  if (stage === 'cannot-start-photos') {
  return (
    <CannotStartPhotosStep
      jobId={jobId}
      jobAddress={jobAddress}
      photos={cannotStartPhotos}
      onUploadComplete={handleCannotStartUpload}
      onContinue={() =>
        setStage('cannot-start-signature')
      }
    />
  )
}
if (stage === 'cannot-start-signature') {
  if (!workflowRecordId) {
    return null
  }

  return (
    <CannotStartSignatureStep
      jobId={jobId}
      recordId={workflowRecordId}
      onBack={() => setStage('cannot-start-photos')}
      onComplete={() => setStage('cannot-start-complete')}
    />
  )
}
if (stage === 'cannot-start-complete') {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={currentProgress.step}
        totalSteps={6}
        label={currentProgress.label}
      />

      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-lg font-bold text-green-800">
          Job Updated
        </p>

        <p className="mt-2 text-sm leading-6 text-green-700">
          The office has received your Cannot Start report.
        </p>
      </div>

      <div className="mt-6">
        <PrimaryButton
          onClick={() => {
            window.location.href = '/my-jobs'
          }}
        >
          Return to My Jobs
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}
if (stage === 'dashpivot') {
  return (
    <RamsStep
      confirmed={ramsConfirmed}
      onConfirmedChange={setRamsConfirmed}
      onContinue={confirmRams}
    />
  )
}
if (stage === 'after-photos') {
  return (
    <AfterPhotosStep
      jobId={jobId}
      jobAddress={jobAddress}
      photos={afterPhotos}
      onUploadComplete={handleAfterPhotosUpload}
      onContinue={() => setStage('review')}
    />
  )
}

if (stage === 'work-in-progress') {
  return (
    <WorkInProgressStep
  onComplete={() => setStage('after-photos')}
/>
  )
}
if (stage === 'review') {
  return (
    <ReviewSubmissionStep
      beforePhotos={beforePhotos}
      afterPhotos={afterPhotos}
      additionalInformation={completionNotes}
      onAdditionalInformationChange={
        setCompletionNotes
      }
      onContinue={saveCompletionNotes}
    />
  )
}
if (stage === 'signature') {
  if (!workflowRecordId) {
    return null
  }

  return (
    <JobSignatureStep
      jobId={jobId}
      recordId={workflowRecordId}
      onBack={() => setStage('review')}
      onComplete={() => setStage('complete')}
    />
  )
}
if (stage === 'complete') {
  return (
    <MobileCard>
      <WorkflowProgress
        currentStep={7}
        totalSteps={7}
        label="Complete"
      />

      <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
        <p className="text-lg font-bold text-green-800">
          Job Completed
        </p>

        <p className="mt-2 text-sm text-green-700">
          The office has received your completed job.
        </p>
      </div>

      <div className="mt-6">
        <PrimaryButton
          onClick={() => {
            window.location.href = '/my-jobs'
          }}
        >
          Return to My Jobs
        </PrimaryButton>
      </div>
    </MobileCard>
  )
}
 if (stage === 'working') {
  return (
    <BeforePhotosStep
      jobId={jobId}
      jobAddress={jobAddress}
      photos={beforePhotos}
      onUploadComplete={handleBeforePhotosUpload}
      onContinue={() => setStage('work-in-progress')}
    />
  )
}

    

 return (
  <CanStartStep
    saving={saving}
    error={error}
    onAnswer={saveSiteArrival}
  />
)
}