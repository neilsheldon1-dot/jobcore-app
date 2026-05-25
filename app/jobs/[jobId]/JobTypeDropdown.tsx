'use client'

import { useState } from 'react'

export default function JobTypeDropdown({
  jobId,
  currentJobType,
  jobTypes,
}: {
  jobId: string
  currentJobType: string
  jobTypes: any[]
}) {
  const [open, setOpen] = useState(false)

  async function updateJobType(jobType: string) {
    setOpen(false)

    await fetch('/api/update-job-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        job_type: jobType,
      }),
    })

    window.location.reload()
  }

  return (
    <div className="relative mt-2">
      <p
        onClick={() => setOpen(!open)}
        className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-bold border cursor-pointer hover:brightness-95 transition ${
          currentJobType === 'Reactive'
? 'bg-lime-100 text-lime-800 border-lime-200'

: currentJobType === 'Flat Roof'
? 'bg-sky-100 text-sky-700 border-sky-200'

: currentJobType === 'Re Roof'
? 'bg-sky-400 text-white border-blue-900'

: currentJobType === 'Sika Roof'
? 'bg-cyan-100 text-cyan-800 border-cyan-200'

: currentJobType === 'Roofline / EPS'
? 'bg-orange-100 text-orange-700 border-orange-200'

: currentJobType === 'Hydro'
? 'bg-teal-100 text-teal-800 border-teal-200'

: currentJobType === 'Scheme'
? 'bg-yellow-100 text-yellow-800 border-yellow-200'

: currentJobType === 'Planned'
? 'bg-green-200 text-green-700 border-slate-200'

: currentJobType === 'Slate / Tile Repair'
? 'bg-indigo-100 text-indigo-700 border-indigo-200'

: currentJobType === 'Roof Repair'
? 'bg-violet-100 text-violet-700 border-violet-200'

: currentJobType === 'Gutter Work'
? 'bg-emerald-100 text-emerald-700 border-emerald-200'

: currentJobType === 'Chimney'
? 'bg-rose-100 text-rose-700 border-rose-200'

: currentJobType === 'Lead Work'
? 'bg-zinc-300 text-zinc-900 border-zinc-500'

: currentJobType === 'Velux'
? 'bg-pink-100 text-black border-pink-200'

: currentJobType === 'Pointing'
? 'bg-stone-400 text-white border-stone-300'

: currentJobType === 'Fascia / Soffit'
? 'bg-purple-900 text-white border-stone-300'

: 'bg-slate-100 text-slate-700 border-slate-200'
        
        }`}
      >
        {currentJobType || 'No Type Set'}
      </p>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-64">
          <div className="flex flex-col gap-1">
            {jobTypes.map((jobType) => (
              <button
                key={jobType.id}
                onClick={() => updateJobType(jobType.name)}
                className={`text-left px-3 py-2 rounded-xl text-sm transition ${
                  currentJobType === jobType.name
                    ? 'bg-slate-200 text-slate-900 font-bold'
                    : 'hover:bg-slate-100'
                }`}
              >
                {jobType.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}