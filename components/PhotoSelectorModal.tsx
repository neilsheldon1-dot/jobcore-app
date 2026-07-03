import PhotoSelector from '@/components/PhotoSelector'

type PhotoSelectorModalProps = {
  photos: any[]
  selectedPhotoIds: string[]
  onTogglePhoto: (photoId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onClose: () => void
}

export default function PhotoSelectorModal({
  photos,
  selectedPhotoIds,
  onTogglePhoto,
  onSelectAll,
  onClearAll,
  onClose,
}: PhotoSelectorModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-5xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">
              Photographic Evidence
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              Choose Photographs
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select the photographs to include in the completion report.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <PhotoSelector
          photos={photos}
          selectedPhotoIds={selectedPhotoIds}
          onTogglePhoto={onTogglePhoto}
          onSelectAll={onSelectAll}
          onClearAll={onClearAll}
        />

        <div className="flex justify-end mt-5 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}