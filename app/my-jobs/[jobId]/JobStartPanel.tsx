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
import CanCompleteStep from './steps/CanCompleteStep'
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
  | 'completion-check'
  | 'completion-limitation'
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
  const [completionLimitationComments, setCompletionLimitationComments] =
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

      setStage(canStart ? 'completion-check' : 'cannot-start')
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

  async function saveCompletionAssessment(
    canComplete: boolean
  ) {
    if (!workflowRecordId) {
      setError('Workflow record is missing.')
      return
    }

    if (!canComplete) {
      setError('')
      setStage('completion-limitation')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/completion-assessment',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId: workflowRecordId,
            canComplete: true,
            reasons: [],
            comments: '',
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to save the completion assessment.'
        )
      }

      setStage('dashpivot')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save the completion assessment.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function saveCompletionLimitation() {
    if (!workflowRecordId) {
      setError('Workflow record is missing.')
      return
    }

    const comments = completionLimitationComments.trim()

    if (!comments) {
      setError(
        'Please tell the office what cannot be completed and why.'
      )
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        '/api/compliance/completion-assessment',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            recordId: workflowRecordId,
            canComplete: false,
            reasons: [],
            comments,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to save the completion limitation.'
        )
      }

      setStage('dashpivot')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save the completion limitation.'
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

  if (stage === 'completion-check') {
    return (
      <CanCompleteStep
        saving={saving}
        error={error}
        onAnswer={saveCompletionAssessment}
      />
    )
  }

  if (stage === 'completion-limitation') {
    return (
      <MobileCard>
        <p className="text-base font-bold text-slate-700">
          What Cannot Be Completed?
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Tell the office what is affected and why. You can still
          continue with any work that can be completed safely.
        </p>

        <textarea
          value={completionLimitationComments}
          onChange={(event) =>
            setCompletionLimitationComments(event.target.value)
          }
          rows={5}
          placeholder="For example: More rotten decking found and additional materials are required."
          className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
        />

        {error && (
          <p className="mt-4 text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <div className="mt-5 space-y-3">
          <PrimaryButton
            onClick={saveCompletionLimitation}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save and Continue'}
          </PrimaryButton>

          <button
            type="button"
            onClick={() => {
              setError('')
              setStage('completion-check')
            }}
            disabled={saving}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </MobileCard>
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
  currentStep={5}
  totalSteps={5}
  label="Complete"
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