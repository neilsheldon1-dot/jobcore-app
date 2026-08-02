'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import PhotoUploadForm from '../../PhotoUploadForm'

type WorkflowPhoto = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
  created_at?: string
  uploaded_by?: string | null
}

type CannotStartPhotosStepProps = {
  jobId: string
  recordId: string
  jobAddress: string
  initialPhotos: WorkflowPhoto[]
}

export default function CannotStartPhotosStep({
  jobId,
  recordId,
  jobAddress,
  initialPhotos,
}: CannotStartPhotosStepProps) {
  const router = useRouter()

  const [photos, setPhotos] =
    useState<WorkflowPhoto[]>(initialPhotos)

  const [continuing, setContinuing] =
    useState(false)

  async function handleUploadComplete(
    uploadedPhotos: WorkflowPhoto[]
  ) {
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
          recordId,
          photoIds,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok) {
      throw new Error(
        result.error ||
          'Photos were uploaded but could not be attached to the workflow'
      )
    }

    setPhotos((currentPhotos) => {
      const existingIds = new Set(
        currentPhotos.map((photo) => photo.id)
      )

      const newPhotos = uploadedPhotos.filter(
        (photo) => !existingIds.has(photo.id)
      )

      return [...currentPhotos, ...newPhotos]
    })
  }

  function continueToSignature() {
    setContinuing(true)

    router.push(
      `/jobs/${jobId}/compliance/${recordId}?step=cannot_start_signature`
    )
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Cannot Start
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Supporting photos
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        Add photographs where they help explain why work could not start. Photos are optional.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-bold text-slate-900">
              Cannot Start evidence
            </p>

            <p className="mt-1 text-sm text-slate-500">
              JobCore will automatically organise these photographs under the Cannot Start group.
            </p>
          </div>

          <PhotoUploadForm
            jobId={jobId}
            jobAddress={jobAddress}
            defaultPhotoGroup="Cannot Start"
            buttonLabel="+ Add Photos"
            modalTitle="Add Cannot Start Photos"
            lockPhotoGroup
            reloadOnComplete={false}
            onUploadComplete={
              handleUploadComplete
            }
          />
        </div>
      </div>

      {photos.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-bold text-slate-900">
              Attached photographs
            </p>

            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              {photos.length} photo
              {photos.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white"
              >
                <img
                  src={photo.file_url}
                  alt={
                    photo.category ||
                    'Cannot Start evidence'
                  }
                  className="h-36 w-full object-cover"
                />

                <div className="p-3">
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Cannot Start
                  </p>

                  {photo.category && (
                    <p className="mt-1 text-sm text-slate-700">
                      {photo.category}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-bold text-slate-700">
            No photos attached
          </p>

          <p className="mt-2 text-sm text-slate-500">
            You can continue without adding photographs.
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/jobs/${jobId}/compliance/${recordId}?step=cannot_start_comments`
            )
          }
          disabled={continuing}
          className="text-sm font-bold text-blue-600 disabled:opacity-50"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={continueToSignature}
          disabled={continuing}
          className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {continuing
            ? 'Continuing...'
            : 'Continue →'}
        </button>
      </div>
    </section>
  )
}