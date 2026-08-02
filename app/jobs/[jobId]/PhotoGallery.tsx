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

  async function deletePhoto(photo: any) {
    const confirmed = window.confirm(
      'Delete this photo?'
    )

    if (!confirmed) return

    const filePath =
      photo.file_url.split('/job-photos/')[1]

    if (filePath) {
      await fetch('/api/delete-photo-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      })
    }

    const response = await fetch(
      '/api/delete-photo',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          photoId: photo.id,
        }),
      }
    )

    if (!response.ok) {
      alert('Could not delete photo')
      return
    }

    window.location.reload()
  }

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Job Photos
          </h2>

          <PhotoUploadForm
            jobId={jobId}
            jobAddress={jobAddress}
          />
        </div>

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {photos.map((photo) => (
              <div
                key={photo.id}
                onClick={() =>
                  setSelectedPhoto(photo)
                }
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-slate-50 text-left transition hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    deletePhoto(photo)
                  }}
                  className="absolute right-2 top-2 z-10 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-bold text-red-600 shadow transition hover:bg-red-50"
                >
                  🗑
                </button>

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
                    ).toLocaleDateString('en-GB')}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Added by{' '}
                    {photo.uploaded_by || 'Unknown'}
                  </p>
                </div>
              </div>
            ))}
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
            onClick={(e) => e.stopPropagation()}
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