type NoteSelectorModalProps = {
  title: string
  notes: any[]
  selectedNoteIds: string[]
  onToggleNote: (noteId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  onClose: () => void
}

export default function NoteSelectorModal({
  title,
  notes,
  selectedNoteIds,
  onToggleNote,
  onSelectAll,
  onClearAll,
  onClose,
}: NoteSelectorModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">
              Supporting Evidence
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              {title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Select the notes to use when creating the completion report.
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

        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            Select all
          </button>

          <span className="text-xs text-slate-300">|</span>

          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-bold text-slate-500 hover:text-slate-700 hover:underline cursor-pointer"
          >
            Clear all
          </button>
        </div>

        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => {
              const selected = selectedNoteIds.includes(note.id)

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => onToggleNote(note.id)}
                  className={`w-full border rounded-xl p-4 text-left transition cursor-pointer ${
                    selected
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold shrink-0 ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-transparent border-slate-300'
                      }`}
                    >
                      ✓
                    </span>

                    <div>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">
                        {note.content}
                      </p>

                      <p className="text-xs text-slate-400 mt-2">
                        {note.created_by || 'Unknown'} ·{' '}
                        {new Date(note.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            No notes available.
          </p>
        )}

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