'use client'

type PhotoSelectorProps = {
  photos: any[]
  selectedPhotoIds: string[]
  onTogglePhoto: (photoId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
}

export default function PhotoSelector({
  photos,
  selectedPhotoIds,
  onTogglePhoto,
  onSelectAll,
  onClearAll,
}: PhotoSelectorProps) {
  if (!photos || photos.length === 0) {
    return (
      <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
        <p className="text-sm font-bold text-slate-700">
          No photos available
        </p>
      </div>
    )
  }

  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white">
      <div className="flex items-center justify-between mb-3">
  <div>
    <p className="text-sm font-bold text-slate-900">
      Select Photos
    </p>

    <p className="text-xs text-slate-400">
      {selectedPhotoIds.length} of {photos.length} selected
    </p>
  </div>

  <div className="flex gap-2">
    <button
      type="button"
      onClick={onSelectAll}
      className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
    >
      Select All
    </button>

    <button
      type="button"
      onClick={onClearAll}
      className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
    >
      Clear All
    </button>
  </div>
</div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => {
          const selected = selectedPhotoIds.includes(photo.id)

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => onTogglePhoto(photo.id)}
              className={`relative overflow-hidden rounded-xl border transition cursor-pointer ${
                selected
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-slate-200 hover:border-slate-400'
              }`}
            >
              <img
                src={photo.file_url || photo.original_file_url}
                alt="Job photo"
                className="h-28 w-full object-cover"
              />

              <span
                className={`absolute top-2 right-2 w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${
                  selected
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-transparent border-slate-300'
                }`}
              >
                ✓
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}