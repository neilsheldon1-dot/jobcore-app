'use client'

import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useRouter } from 'next/navigation'
import MobileCard from '../../../components/app/MobileCard'
import PhotoUploadForm from '../../jobs/[jobId]/PhotoUploadForm'

type Props = {
  jobId: string
  jobAddress: string
}

type WorkflowPhoto = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
  created_at?: string
  uploaded_by?: string | null
}

export default function UpvcJobPanel({
  jobId,
  jobAddress,
}: Props) {
  const router = useRouter()

  const signatureCanvasRef =
    useRef<HTMLCanvasElement | null>(
      null
    )

  const [started, setStarted] =
    useState(false)

  const [completed, setCompleted] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  const [notes, setNotes] =
    useState('')

  const [
    completedBy,
    setCompletedBy,
  ] = useState('')

  const [
    isDrawing,
    setIsDrawing,
  ] = useState(false)

  const [
    hasSignature,
    setHasSignature,
  ] = useState(false)

  const [
    beforePhotos,
    setBeforePhotos,
  ] = useState<WorkflowPhoto[]>([])

  const [
    afterPhotos,
    setAfterPhotos,
  ] = useState<WorkflowPhoto[]>([])

  useEffect(() => {
    if (!started) return

    const canvas =
      signatureCanvasRef.current

    if (!canvas) return

    const rect =
      canvas.getBoundingClientRect()

    const pixelRatio =
      window.devicePixelRatio || 1

    canvas.width =
      rect.width * pixelRatio

    canvas.height =
      rect.height * pixelRatio

    const context =
      canvas.getContext('2d')

    if (!context) return

    context.scale(
      pixelRatio,
      pixelRatio
    )

    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle =
      '#0f172a'
  }, [started])

  function addBeforePhotos(
    uploadedPhotos: WorkflowPhoto[]
  ) {
    setBeforePhotos((current) => {
      const existingIds =
        new Set(
          current.map(
            (photo) =>
              photo.id
          )
        )

      return [
        ...current,
        ...uploadedPhotos.filter(
          (photo) =>
            !existingIds.has(
              photo.id
            )
        ),
      ]
    })
  }

  function addAfterPhotos(
    uploadedPhotos: WorkflowPhoto[]
  ) {
    setAfterPhotos((current) => {
      const existingIds =
        new Set(
          current.map(
            (photo) =>
              photo.id
          )
        )

      return [
        ...current,
        ...uploadedPhotos.filter(
          (photo) =>
            !existingIds.has(
              photo.id
            )
        ),
      ]
    })
  }

  function getCanvasPosition(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      signatureCanvasRef.current

    if (!canvas) return null

    const rect =
      canvas.getBoundingClientRect()

    return {
      x:
        event.clientX -
        rect.left,
      y:
        event.clientY -
        rect.top,
    }
  }

  function startDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      signatureCanvasRef.current

    const position =
      getCanvasPosition(event)

    if (
      !canvas ||
      !position
    ) {
      return
    }

    const context =
      canvas.getContext('2d')

    if (!context) return

    canvas.setPointerCapture(
      event.pointerId
    )

    context.beginPath()

    context.moveTo(
      position.x,
      position.y
    )

    setIsDrawing(true)
    setHasSignature(true)
    setError('')
  }

  function draw(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    if (!isDrawing) return

    const canvas =
      signatureCanvasRef.current

    const position =
      getCanvasPosition(event)

    if (
      !canvas ||
      !position
    ) {
      return
    }

    const context =
      canvas.getContext('2d')

    if (!context) return

    context.lineTo(
      position.x,
      position.y
    )

    context.stroke()
  }

  function stopDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas =
      signatureCanvasRef.current

    if (
      canvas?.hasPointerCapture(
        event.pointerId
      )
    ) {
      canvas.releasePointerCapture(
        event.pointerId
      )
    }

    setIsDrawing(false)
  }

  function clearSignature() {
    const canvas =
      signatureCanvasRef.current

    if (!canvas) return

    const context =
      canvas.getContext('2d')

    if (!context) return

    const rect =
      canvas.getBoundingClientRect()

    context.clearRect(
      0,
      0,
      rect.width,
      rect.height
    )

    setHasSignature(false)
    setError('')
  }

  async function completeJob() {
    if (!notes.trim()) {
      setError(
        'Please describe the work completed.'
      )
      return
    }

    if (!completedBy.trim()) {
      setError(
        'Please enter the name of the person who completed the work.'
      )
      return
    }

    if (
      beforePhotos.length === 0
    ) {
      setError(
        'Please add at least one before photo.'
      )
      return
    }

    if (
      afterPhotos.length === 0
    ) {
      setError(
        'Please add at least one after photo.'
      )
      return
    }

    if (!hasSignature) {
      setError(
        'Please add a signature before completing the job.'
      )
      return
    }

    const canvas =
      signatureCanvasRef.current

    if (!canvas) {
      setError(
        'The signature could not be read.'
      )
      return
    }

    const signatureDataUrl =
      canvas.toDataURL(
        'image/png'
      )

    setSaving(true)
    setError('')

    try {
      const response =
        await fetch(
          '/api/partner-job-completion',
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json',
            },
            body:
              JSON.stringify({
                jobId,
                completedBy,
                workCompleted:
                  notes,
                signatureDataUrl,
              }),
          }
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to finish submitting this job.'
        )
      }

      setCompleted(true)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to finish submitting this job.'
      )
    } finally {
      setSaving(false)
    }
  }

  if (completed) {
    return (
      <MobileCard>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl font-black text-green-700">
            ✓
          </div>

          <h2 className="mt-4 text-xl font-black text-slate-900">
            Job Completed
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your work has been
            submitted successfully.
          </p>

          <button
            type="button"
            onClick={() => {
              router.push(
                '/upvc-jobs'
              )
              router.refresh()
            }}
            className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            Return to Jobs
          </button>
        </div>
      </MobileCard>
    )
  }

  if (!started) {
    return (
      <MobileCard>
        <h2 className="text-lg font-bold text-slate-900">
          Accept Job
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          Accept this job when you
          arrive on site.
        </p>

        <button
          type="button"
          onClick={() =>
            setStarted(true)
          }
          className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white transition hover:bg-orange-600"
        >
          Accept Job
        </button>
      </MobileCard>
    )
  }

  return (
    <MobileCard>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">
          Work in Progress
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Add the details needed to
          complete this job.
        </p>
      </div>

      <section>
        <h3 className="text-sm font-bold text-slate-900">
          Before Photos
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Show the condition before
          work started.
        </p>

        {beforePhotos.length >
          0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {beforePhotos.map(
              (photo) => (
                <img
                  key={photo.id}
                  src={
                    photo.file_url
                  }
                  alt="Before work"
                  className="h-32 w-full rounded-xl border border-slate-200 object-cover"
                />
              )
            )}
          </div>
        )}

        <div className="mt-4">
          <PhotoUploadForm
            jobId={jobId}
            jobAddress={
              jobAddress
            }
            defaultPhotoGroup="Before"
            buttonLabel="Add Before Photos"
            modalTitle="Add Before Photos"
            lockPhotoGroup
            reloadOnComplete={
              false
            }
            onUploadComplete={
              addBeforePhotos
            }
          />
        </div>
      </section>

      <hr className="my-6 border-slate-200" />

      <section>
        <label
          htmlFor="work-completed"
          className="text-sm font-bold text-slate-900"
        >
          Work Completed
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Describe what was completed
          at the property.
        </p>

        <textarea
          id="work-completed"
          value={notes}
          onChange={(event) =>
            setNotes(
              event.target.value
            )
          }
          rows={6}
          placeholder="For example: Replaced the failed glazed unit and adjusted the window hinges."
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </section>

      <hr className="my-6 border-slate-200" />

      <section>
        <h3 className="text-sm font-bold text-slate-900">
          After Photos
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Show the finished work
          clearly.
        </p>

        {afterPhotos.length >
          0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {afterPhotos.map(
              (photo) => (
                <img
                  key={photo.id}
                  src={
                    photo.file_url
                  }
                  alt="Completed work"
                  className="h-32 w-full rounded-xl border border-slate-200 object-cover"
                />
              )
            )}
          </div>
        )}

        <div className="mt-4">
          <PhotoUploadForm
            jobId={jobId}
            jobAddress={
              jobAddress
            }
            defaultPhotoGroup="After"
            buttonLabel="Add After Photos"
            modalTitle="Add After Photos"
            lockPhotoGroup
            reloadOnComplete={
              false
            }
            onUploadComplete={
              addAfterPhotos
            }
          />
        </div>
      </section>

      <hr className="my-6 border-slate-200" />

      <section>
        <label
          htmlFor="completed-by"
          className="text-sm font-bold text-slate-900"
        >
          Completed By
        </label>

        <p className="mt-1 text-sm text-slate-500">
          Name of the person who
          completed the work.
        </p>

        <input
          id="completed-by"
          type="text"
          value={completedBy}
          onChange={(event) =>
            setCompletedBy(
              event.target.value
            )
          }
          placeholder="For example: Trevor Jones"
          className="mt-3 w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
      </section>

      <hr className="my-6 border-slate-200" />

      <section>
        <h3 className="text-sm font-bold text-slate-900">
          Signature
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          Please sign to confirm the
          completed work.
        </p>

        <div className="mt-4 overflow-hidden rounded-xl border-2 border-slate-300 bg-white">
          <canvas
            ref={
              signatureCanvasRef
            }
            onPointerDown={
              startDrawing
            }
            onPointerMove={draw}
            onPointerUp={
              stopDrawing
            }
            onPointerCancel={
              stopDrawing
            }
            onPointerLeave={(
              event
            ) => {
              if (isDrawing) {
                stopDrawing(
                  event
                )
              }
            }}
            className="h-48 w-full touch-none cursor-crosshair"
          />
        </div>

        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={
              clearSignature
            }
            disabled={
              saving ||
              !hasSignature
            }
            className="text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear Signature
          </button>
        </div>
      </section>

      {error && (
        <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={
          completeJob
        }
        disabled={saving}
        className="mt-8 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving
          ? 'Submitting...'
          : 'Complete Job'}
      </button>
    </MobileCard>
  )
}