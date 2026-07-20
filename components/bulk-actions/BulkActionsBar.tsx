'use client'

type BulkActionsBarProps = {
  selectedCount: number
  currentStatus?: string
  bulkStatus: string
  bulkUpdating: boolean
  canCreateApprovalChase: boolean
  canChaseScaffoldQuotes: boolean
  onBulkStatusChange: (value: string) => void
  onApply: () => void
  onPrintSelected: () => void
}

export default function BulkActionsBar({
  selectedCount,
  currentStatus,
  bulkStatus,
  bulkUpdating,
  canCreateApprovalChase,
  canChaseScaffoldQuotes,
  onBulkStatusChange,
  onApply,
  onPrintSelected,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  return (
    <div className="mb-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <p className="text-sm font-bold text-slate-700">
        {selectedCount}{' '}
        {selectedCount === 1
          ? 'Job Selected'
          : 'Jobs Selected'}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={bulkStatus}
          onChange={(event) =>
            onBulkStatusChange(event.target.value)
          }
          className="w-64 border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold bg-white"
        >
          <option value="">Choose Action...</option>

<option value="" disabled>
  ── Change Status ──
</option>

{currentStatus !== 'Allocated' && (
  <option value="Allocated">
    Move to Allocated
  </option>
)}

{currentStatus !== 'Ready' && (
  <option value="Ready">
    Move to Ready
  </option>
)}

{currentStatus !== 'Needs Invoicing' && (
  <option value="Needs Invoicing">
    Move to Needs Invoicing
  </option>
)}

{currentStatus !== 'Complete' && (
  <option value="Complete">
    Move to Complete
  </option>
)}

{(canCreateApprovalChase ||
  canChaseScaffoldQuotes) && (
  <option value="" disabled>
    ── Communication ──
  </option>
)}

{canCreateApprovalChase && (
  <option value="CHASE_APPROVALS">
    Create Approval Chase Draft
  </option>
)}

{canChaseScaffoldQuotes && (
  <option value="CHASE_SCAFFOLD_QUOTES">
    Chase Scaffold Quotes
  </option>
)}

        </select>

        <button
          type="button"
          onClick={onApply}
          disabled={!bulkStatus || bulkUpdating}
          className="bg-slate-800 text-white px-5 py-2 rounded-xl font-bold hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {bulkUpdating ? 'Updating...' : 'Apply'}
        </button>

        <button
  type="button"
  onClick={onPrintSelected}
  disabled={bulkUpdating}
  className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
>
  Print Selected
</button>
      </div>
    </div>
  )
}