'use client'

function getAsbestosStatusStyle(statusName?: string) {
  switch (statusName) {
    case 'Report Requested':
      return 'bg-amber-50 text-amber-800 border-amber-300'

    case 'Inspection Required':
      return 'bg-orange-50 text-orange-800 border-orange-300'

    case 'Removal Required':
      return 'bg-red-50 text-red-800 border-red-300'

    case 'Safe To Work':
      return 'bg-green-50 text-green-800 border-green-300'

    default:
      return 'bg-white text-slate-700 border-gray-300'
  }
}

export default function AsbestosStatusDropdown({
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
    await fetch('/api/update-asbestos-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        asbestos_status_id: e.target.value,
      }),
    })

    window.location.reload()
  }

  return (
    <select
      value={currentStatusId || ''}
      onChange={handleChange}
      className={`w-full border rounded-xl px-3 py-2 text-sm font-bold ${getAsbestosStatusStyle(currentStatus?.name)}`}
    >
      <option value="">
        Select Asbestos Status
      </option>

      {statuses.map((status) => (
        <option key={status.id} value={status.id}>
          {status.name}
        </option>
      ))}
    </select>
  )
}