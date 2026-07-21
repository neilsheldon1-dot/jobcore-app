'use client'

export type BulkAction = {
  value: string
  label: string
  group: string
}

type BulkActionsBarProps = {
  selectedCount: number
  selectedAction: string
  updating: boolean
  actions: BulkAction[]
  onActionChange: (value: string) => void
  onApply: () => void
}

export default function BulkActionsBar({
  selectedCount,
  selectedAction,
  updating,
  actions,
  onActionChange,
  onApply,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null

  const actionGroups = actions.reduce(
    (
      groups: Record<string, BulkAction[]>,
      action
    ) => {
      if (!groups[action.group]) {
        groups[action.group] = []
      }

      groups[action.group].push(action)

      return groups
    },
    {}
  )

  return (
    <div className="mb-4 bg-blue-600 border border-white rounded-2xl px-5 py-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 shadow-lg transition-all duration-300">
      <p className="text-sm font-bold text-white">
        ✓ {selectedCount}{' '} 
{selectedCount === 1 ? 'job' : 'jobs'} Selected
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={selectedAction}
          onChange={(event) =>
            onActionChange(event.target.value)
          }
          className="w-64 border border-slate-300 rounded-xl px-4 py-2 text-sm font-semibold bg-white shadow-sm"
        >
          <option value="">Choose Action...</option>

          {Object.entries(actionGroups).map(
            ([groupName, groupActions]) => (
              <optgroup
                key={groupName}
                label={groupName}
              >
                {groupActions.map((action) => (
                  <option
                    key={action.value}
                    value={action.value}
                  >
                    {action.label}
                  </option>
                ))}
              </optgroup>
            )
          )}
        </select>

        <button
          type="button"
          onClick={onApply}
          disabled={!selectedAction || updating}
         className="bg-white text-black px-4 py-2 rounded-xl font-bold hover:bg-slate-100 transition disabled:bg-white disabled:text-black disabled:opacity-100 disabled:cursor-not-allowed cursor-pointer shadow-sm"
        >
          {updating ? 'Working...' : 'Apply'}
        </button>
      </div>
    </div>
  )
}