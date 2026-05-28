'use client'

import { useState } from 'react'
import PhotoUploadForm from './PhotoUploadForm'

export default function PhotoGallery({
  photos,
  jobId,
}: {
  photos: any[]
  jobId: string
}) {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)
async function deletePhoto(photo: any) {
  const confirmed = window.confirm('Delete this photo?')

  if (!confirmed) return

  const filePath = photo.file_url.split('/job-photos/')[1]

  if (filePath) {
    await fetch('/api/delete-photo-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    })
  }

  const response = await fetch('/api/delete-photo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ photoId: photo.id }),
  })

  if (!response.ok) {
    alert('Could not delete photo')
    return
  }

  window.location.reload()
}
  return (
    <>
      <div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">
            Job Photos
          </h2>

          <PhotoUploadForm jobId={jobId} />
        </div>

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div
  key={photo.id}
  onClick={() => setSelectedPhoto(photo)}
  className="group relative border border-gray-200 rounded-2xl overflow-hidden bg-slate-50 text-left hover:shadow-md transition cursor-pointer"
>
                <button
  type="button"
  onClick={(e) => {
    e.stopPropagation()
    deletePhoto(photo)
  }}
  className="absolute top-2 right-2 z-10 bg-white text-red-600 border border-gray-200 w-8 h-8 rounded-full text-sm font-bold shadow hover:bg-red-50 transition cursor-pointer flex items-center justify-center"
>
  🗑
</button>
                <img
                  src={photo.file_url}
                  alt="Job Photo"
                  className="w-full h-40 object-cover group-hover:scale-[1.02] transition"
                />

                <div className="p-3">
                  <p className="text-xs uppercase font-bold text-slate-500">
                    {photo.category}
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(photo.created_at).toLocaleDateString('en-GB')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
  Added by {photo.uploaded_by || 'Unknown'}
</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-2xl p-8 text-center bg-slate-50">
            <p className="text-sm text-slate-500">
              No photos uploaded yet
            </p>
          </div>
        )}

      </div>

      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-5xl w-full"
          >
            <img
              src={selectedPhoto.file_url}
              alt="Expanded Job Photo"
              className="w-full max-h-[80vh] object-contain rounded-2xl"
            />

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedPhoto(null)}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold"
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