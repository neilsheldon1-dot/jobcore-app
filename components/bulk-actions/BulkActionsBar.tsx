'use client'

export type BulkAction = {
  value: string
  label: string
  group: string
}

export type Assignee = {
  id: string
  display_name: string | null
  full_name: string | null
  email: string | null
}

type BulkActionsBarProps = {
  selectedCount: number
  selectedAction: string
  selectedAssignee: string
  assignees: Assignee[]
  updating: boolean
  actions: BulkAction[]
  onActionChange: (value: string) => void
  onAssigneeChange: (value: string) => void
  onApply: () => void
}

export default function BulkActionsBar({
  selectedCount,
  selectedAction,
  selectedAssignee,
  assignees,
  updating,
  actions,
  onActionChange,
  onAssigneeChange,
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

  const requiresAssignee =
    selectedAction === 'ALLOCATE_TO'

  const applyDisabled =
    !selectedAction ||
    updating ||
    (requiresAssignee && !selectedAssignee)

  return (
    <div role="region" aria-label="Bulk job actions" className="sticky top-[var(--app-header-height)] z-30 mb-4 flex flex-col gap-2 rounded-2xl border border-white bg-blue-600 px-3 py-3 shadow-lg sm:gap-4 sm:px-5 sm:py-4 lg:flex-row lg:items-center lg:justify-between">
      <p aria-live="polite" className="text-sm font-bold text-white">
        ✓ {selectedCount}{' '}
        {selectedCount === 1 ? 'job' : 'jobs'} Selected
      </p>

      <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
        <select
          value={selectedAction}
          aria-label="Bulk action"
          disabled={updating}
          onChange={(event) =>
            onActionChange(event.target.value)
          }
          className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm sm:w-64"
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

        {requiresAssignee && (
          <select
            value={selectedAssignee}
            aria-label="Assignee"
            disabled={updating}
            onChange={(event) =>
              onAssigneeChange(event.target.value)
            }
            className="w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold shadow-sm sm:w-64"
          >
            <option value="">
              Choose Assignee...
            </option>

            {assignees.map((assignee) => {
              const name =
                assignee.display_name ||
                assignee.full_name ||
                assignee.email ||
                'Unnamed user'

              return (
                <option
                  key={assignee.id}
                  value={assignee.id}
                >
                  {name}
                </option>
              )
            })}
          </select>
        )}

        <button
          type="button"
          onClick={onApply}
          disabled={applyDisabled}
          className="cursor-pointer rounded-xl bg-white px-4 py-2 font-bold text-black shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updating ? 'Working...' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
