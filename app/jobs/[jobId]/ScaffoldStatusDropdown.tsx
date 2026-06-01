'use client'

function getScaffoldStatusStyle(statusName?: string) {
  switch (statusName) {
    case 'Awaiting Quote':
      return 'bg-amber-50 text-amber-800 border-amber-300'

    case 'Quote Received':
      return 'bg-blue-50 text-blue-800 border-blue-300'

    case 'Awaiting Erection':
      return 'bg-orange-50 text-orange-800 border-orange-300'

    case 'Scaffold Up':
      return 'bg-green-50 text-green-800 border-green-300'

    case 'Needs Adapting':
      return 'bg-red-50 text-red-800 border-red-300'

    case 'Awaiting Dismantle':
      return 'bg-purple-50 text-purple-800 border-purple-300'

    case 'Scaffold Removed':
      return 'bg-slate-100 text-slate-700 border-slate-300'

    default:
      return 'bg-white text-slate-700 border-gray-300'
  }
}

export default function ScaffoldStatusDropdown({
  jobId,
  currentStatusId,
  statuses,
}: {
  jobId: string
  currentStatusId: number | null
  statuses: any[]
}) {
  const currentStatus = (statuses || []).find(
    (status) => status.id === currentStatusId
  )

  async function handleChange(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    await fetch('/api/update-scaffold-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        scaffold_status_id: e.target.value,
      }),
    })

    window.location.reload()
  }

  return (
    <select
      value={currentStatusId || ''}
      onChange={handleChange}
      className={`w-full border rounded-xl px-3 py-2 text-sm font-bold ${getScaffoldStatusStyle(currentStatus?.name)}`}
    >
      <option value="">
        Select Scaffold Status
      </option>

      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.name}
        </option>
      ))}
    </select>
  )
}