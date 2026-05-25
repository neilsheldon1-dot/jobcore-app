'use client'

import { useState } from 'react'

export default function StatusDropdown({
  jobId,
  currentStatus,
  jobStatuses,
}: {
  jobId: string
  currentStatus: string
  jobStatuses: any[]
}) {
  const [open, setOpen] = useState(false)

  async function updateStatus(status: string) {
    setOpen(false)
    await fetch('/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        status,
      }),
    })

    window.location.reload()
  }

  return (
    <div className="relative mt-2">
      <p
  onClick={() => setOpen(!open)}
  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold border cursor-pointer hover:brightness-95 transition ${
    currentStatus === 'Ticket'
      ? 'bg-pink-100 text-pink-700 border-pink-200'
      : currentStatus === 'Allocated'
? 'bg-emerald-300 text-emerald-800 border-emerald-200'
      : currentStatus === 'Needs Quoting'
      ? 'bg-purple-100 text-purple-700 border-purple-200'
      : currentStatus === 'Awaiting Approval'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : currentStatus === 'Ready'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : currentStatus === 'In Progress'
      ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
      : currentStatus === 'Complete'
      ? 'bg-green-100 text-green-700 border-green-200'
      : currentStatus === 'Needs Invoicing'
      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
      : 'bg-slate-100 text-slate-700 border-slate-200'
  }`}
>
  {currentStatus}
</p>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-64">
          <div className="flex flex-col gap-1">
            {jobStatuses.map((status) => (
              <button
                key={status.id}
                onClick={() => updateStatus(status.name)}
                className={`text-left px-3 py-2 rounded-xl text-sm transition ${
                  currentStatus === status.name
                    ? 'bg-blue-100 text-blue-700 font-bold'
                    : 'hover:bg-slate-100'
                }`}
              >
                {status.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}