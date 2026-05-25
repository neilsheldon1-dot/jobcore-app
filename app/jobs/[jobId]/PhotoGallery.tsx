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
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="group relative border border-gray-200 rounded-2xl overflow-hidden bg-slate-50 text-left hover:shadow-md transition"
              >
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
                </div>
              </button>
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