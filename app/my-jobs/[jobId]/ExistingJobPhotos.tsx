'use client'

import { useState } from 'react'
import SectionTitle from '../../../components/app/SectionTitle'
import PhotoViewer from '../../../components/PhotoViewer'

type Photo = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
  created_at?: string | null
  uploaded_by?: string | null
}

export default function ExistingJobPhotos({
  photos,
}: {
  photos: Photo[]
}) {
  const [selectedPhotoId, setSelectedPhotoId] =
    useState<string | null>(null)

  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <>
      <hr className="my-4 border-slate-200" />

      <SectionTitle>
        Existing Job Photos
      </SectionTitle>

      <div className="mt-3 grid grid-cols-2 gap-3">
        {photos.map((photo) => (
          <button
            key={photo.id}
            type="button"
            onClick={(event) => {
              event.currentTarget.focus()
              setSelectedPhotoId(photo.id)
            }}
            className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left"
          >
            <img
              src={photo.file_url}
              alt={
                photo.category ||
                photo.photo_group ||
                'Job photo'
              }
              className="h-32 w-full object-cover"
            />

            {(photo.photo_group || photo.category) && (
              <div className="p-2">
                {photo.photo_group && (
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    {photo.photo_group}
                  </p>
                )}

                {photo.category && (
                  <p className="mt-1 text-xs text-slate-600">
                    {photo.category}
                  </p>
                )}
              </div>
            )}
          </button>
        ))}
      </div>

      <PhotoViewer
        photos={photos}
        selectedPhotoId={selectedPhotoId}
        onSelect={setSelectedPhotoId}
        onClose={() => setSelectedPhotoId(null)}
      />
    </>
  )
}
