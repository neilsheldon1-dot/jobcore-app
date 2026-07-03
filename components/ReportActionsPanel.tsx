type ReportActionsPanelProps = {
  draftingSummary: boolean
  onDraftSummary: () => void
  onCreatePdf: () => void
  report: any
  hasUnsavedChanges: boolean
}

export default function ReportActionsPanel({
  draftingSummary,
  onDraftSummary,
  onCreatePdf,
  report,
  hasUnsavedChanges,
}: ReportActionsPanelProps) {

  const hasReport = !!report?.summary

  const statusLabel = hasUnsavedChanges
  ? 'Unsaved Changes'
  : hasReport
    ? 'Saved'
    : 'Draft Required'

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs uppercase font-bold text-slate-400">
          Document Status
        </p>

        <div className="flex items-center justify-between mt-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
              hasUnsavedChanges
  ? 'bg-orange-100 text-orange-700'
  : hasReport
    ? 'bg-green-100 text-green-700'
    : 'bg-amber-100 text-amber-700'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-xs text-slate-500 mt-2">
          {hasReport
            ? 'This report has been saved to the job.'
            : 'Create and save a report before exporting a PDF.'}
        </p>
       {hasReport && (
  <p className="text-xs text-slate-400 mt-2">
    {report?.updated_at
      ? `Last updated: ${new Date(report.updated_at).toLocaleString('en-GB')}`
      : 'Saved this session'}
  </p>
)}
      </div>

      <div className="p-4">
        <button
          type="button"
          onClick={onDraftSummary}
          disabled={draftingSummary}
          className="w-full bg-purple-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-purple-700 transition cursor-pointer disabled:opacity-50"
        >
          {draftingSummary
            ? 'Creating report...'
            : hasReport
              ? 'Update Report'
              : 'Create Report'}
        </button>

        <button
          type="button"
          onClick={onCreatePdf}
          disabled={!hasReport}
          className="w-full mt-3 bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-900 transition cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          Create PDF
        </button>

        <button
          type="button"
          disabled
          className="w-full mt-2 bg-slate-100 text-slate-400 px-4 py-2 rounded-xl text-xs font-bold cursor-not-allowed"
        >
          Email Council
        </button>
      </div>
    </div>
  )
}