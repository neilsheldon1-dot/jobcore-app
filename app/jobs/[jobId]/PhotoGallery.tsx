'use client'

import { useState } from 'react'

export default function PhotoGallery({ photos }: { photos: any[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null)

  return (
    <>
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold mb-6">Job Photos</h2>

        {photos && photos.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                className="relative border rounded-2xl overflow-hidden bg-gray-50 text-left"
              >
                <span className="absolute top-2 right-2 bg-black/70 text-white text-xs rounded-full px-2 py-1 z-10">
                  [+]
                </span>

                <img
                  src={photo.file_url}
                  alt="Job Photo"
                  className="w-full h-48 object-cover"
                />

                <div className="p-3">
                  <p className="text-sm font-bold uppercase">
                    {photo.category}
                  </p>

                  <p className="text-xs text-gray-500">
                    Uploaded by {photo.uploaded_by}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(photo.created_at).toLocaleString('en-GB')}
                  </p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No photos uploaded yet.</p>
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

            <button
              onClick={() => setSelectedPhoto(null)}
              className="mt-4 bg-black text-white px-6 py-3 rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}