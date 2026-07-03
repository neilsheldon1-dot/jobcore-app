type SummaryEditorModalProps = {
  draftSummary: string
  draftingSummary: boolean
  onChange: (value: string) => void
  onCancel: () => void
  onRegenerate: () => void
  onAccept: () => void
}

export default function SummaryEditorModal({
  draftSummary,
  draftingSummary,
  onChange,
  onCancel,
  onRegenerate,
  onAccept,
}: SummaryEditorModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase font-bold text-slate-400">
              Completion Report
            </p>

            <h2 className="text-xl font-bold text-slate-900">
              Review Completion Report
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              Review the report below. Make any changes before saving it to this job.
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
          >
            ×
          </button>
        </div>

        <textarea
          value={draftSummary}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[220px] border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-800"
        />

        <div className="flex justify-end gap-3 mt-5 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition cursor-pointer"
          >
            Back
          </button>

          <button
            type="button"
            onClick={onRegenerate}
            disabled={draftingSummary}
            className="bg-purple-50 text-purple-700 border border-purple-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-100 transition cursor-pointer disabled:opacity-50"
          >
            Rewrite
          </button>

          <button
            type="button"
            onClick={onAccept}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition cursor-pointer"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  )
}