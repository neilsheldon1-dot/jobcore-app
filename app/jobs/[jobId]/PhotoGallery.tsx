'use client'

import { useState } from 'react'
import PhotoUploadForm from './PhotoUploadForm'

export default function PhotoGallery({
  photos,
  jobId,
  jobAddress,
}: {
  photos: any[]
  jobId: string
  jobAddress: string
}) {
  const [selectedPhoto, setSelectedPhoto] =
    useState<any | null>(null)

  const [selectionMode, setSelectionMode] =
    useState(false)

  const [selectedPhotoIds, setSelectedPhotoIds] =
    useState<string[]>([])

  const [deleting, setDeleting] =
    useState(false)

  function togglePhoto(photoId: string) {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    )
  }

  function selectAllPhotos() {
    setSelectedPhotoIds(
      photos.map((photo) => photo.id)
    )
  }

  function clearSelection() {
    setSelectedPhotoIds([])
  }

  function leaveSelectionMode() {
    setSelectionMode(false)
    setSelectedPhotoIds([])
  }

  async function deletePhotos(photoIds: string[]) {
    if (photoIds.length === 0) return

    const message =
      photoIds.length === 1
        ? 'Delete this photo?'
        : `Delete ${photoIds.length} selected photos?`

    const confirmed = window.confirm(message)

    if (!confirmed) return

    setDeleting(true)

    try {
      const response = await fetch(
        '/api/delete-photos',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            photoIds,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Could not delete the selected photos.'
        )
      }

      window.location.reload()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Could not delete the selected photos.'
      )

      setDeleting(false)
    }
  }

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900">
            Job Photos
          </h2>

          <div className="flex items-center gap-2">
            {photos.length > 0 && !selectionMode && (
              <button
                type="button"
                onClick={() =>
                  setSelectionMode(true)
                }
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Select Photos
              </button>
            )}

            {!selectionMode && (
              <PhotoUploadForm
                jobId={jobId}
                jobAddress={jobAddress}
              />
            )}
          </div>
        </div>

        {selectionMode && (
          <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-bold text-slate-700">
                {selectedPhotoIds.length}{' '}
                {selectedPhotoIds.length === 1
                  ? 'photo'
                  : 'photos'}{' '}
                selected
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllPhotos}
                  disabled={deleting}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={clearSelection}
                  disabled={
                    deleting ||
                    selectedPhotoIds.length === 0
                  }
                  className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={() =>
                    deletePhotos(selectedPhotoIds)
                  }
                  disabled={
                    deleting ||
                    selectedPhotoIds.length === 0
                  }
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deleting
                    ? 'Deleting...'
                    : `Delete Selected${
                        selectedPhotoIds.length > 0
                          ? ` (${selectedPhotoIds.length})`
                          : ''
                      }`}
                </button>

                <button
                  type="button"
                  onClick={leaveSelectionMode}
                  disabled={deleting}
                  className="rounded-lg px-3 py-2 text-sm font-bold text-slate-500 transition hover:text-slate-900 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {photos.map((photo) => {
              const isSelected =
                selectedPhotoIds.includes(photo.id)

              return (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (selectionMode) {
                      togglePhoto(photo.id)
                      return
                    }

                    setSelectedPhoto(photo)
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-slate-50 text-left transition hover:shadow-md ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-200'
                      : 'border-gray-200'
                  }`}
                >
                  {selectionMode ? (
                    <div
                      className={`absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-black shadow ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-white bg-white text-slate-500'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        deletePhotos([photo.id])
                      }}
                      disabled={deleting}
                      className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-red-600 shadow transition hover:bg-red-50 disabled:opacity-50"
                    >
                      🗑
                    </button>
                  )}

                  <img
                    src={photo.file_url}
                    alt={
                      photo.category ||
                      photo.photo_group ||
                      'Job Photo'
                    }
                    className="h-40 w-full object-cover transition group-hover:scale-[1.02]"
                  />

                  <div className="p-3">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      {photo.photo_group ||
                        'Additional'}
                    </p>

                    {photo.category && (
                      <p className="mt-1 text-sm text-slate-700">
                        {photo.category}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-slate-400">
                      {new Date(
                        photo.created_at
                      ).toLocaleDateString(
                        'en-GB'
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Added by{' '}
                      {photo.uploaded_by ||
                        'Unknown'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-slate-50 p-8 text-center">
            <p className="text-sm text-slate-500">
              No photos uploaded yet
            </p>
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full max-w-5xl rounded-3xl bg-white p-4"
          >
            <img
              src={selectedPhoto.file_url}
              alt={
                selectedPhoto.category ||
                selectedPhoto.photo_group ||
                'Expanded Job Photo'
              }
              className="max-h-[80vh] w-full rounded-2xl object-contain"
            />

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() =>
                  setSelectedPhoto(null)
                }
                className="rounded-xl bg-slate-900 px-6 py-3 font-bold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}