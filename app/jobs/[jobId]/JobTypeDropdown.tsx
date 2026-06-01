'use client'

import { useEffect, useRef, useState } from 'react'

function getJobTypeClasses(name: string) {
  return name === 'Reactive'
    ? 'bg-lime-100 text-lime-800 border-lime-200'
    : name === 'Flat Roof'
    ? 'bg-sky-100 text-sky-700 border-sky-200'
    : name === 'Re Roof'
    ? 'bg-sky-400 text-white border-blue-900'
    : name === 'Sika Roof'
    ? 'bg-cyan-100 text-cyan-800 border-cyan-200'
    : name === 'Roofline / EPS'
    ? 'bg-orange-100 text-orange-700 border-orange-200'
    : name === 'Hydro'
    ? 'bg-teal-100 text-teal-800 border-teal-200'
    : name === 'Scheme'
    ? 'bg-amber-900 text-amber-200 border-amber-700'
    : name === 'Planned'
    ? 'bg-green-200 text-green-700 border-slate-200'
    : name === 'Slate / Tile Repair'
    ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
    : name === 'Roof Repair'
    ? 'bg-violet-100 text-violet-700 border-violet-200'
    : name === 'Gutter Work'
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : name === 'Chimney'
    ? 'bg-rose-100 text-rose-700 border-rose-200'
    : name === 'Lead Work'
    ? 'bg-zinc-300 text-zinc-900 border-zinc-500'
    : name === 'Velux'
    ? 'bg-pink-100 text-black border-pink-200'
    : name === 'Pointing'
    ? 'bg-stone-400 text-white border-stone-300'
    : name === 'Fascia / Soffit'
    ? 'bg-purple-900 text-white border-stone-300'
    : name === 'Dry Verge'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : name === 'Valley'
    ? 'bg-red-100 text-red-700 border-red-200'
    : 'bg-slate-100 text-slate-700 border-slate-200'
}

export default function JobTypeDropdown({
  jobId,
  jobTypes,
  currentJobTypes,
}: {
  jobId: string
  jobTypes: any[]
  currentJobTypes: any[]
}) {
  const [open, setOpen] = useState(false)
  const [selectedJobTypes, setSelectedJobTypes] = useState<any[]>(
    currentJobTypes || []
  )

  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const sortedSelectedJobTypes = [...selectedJobTypes].sort((a, b) =>
    (a.job_types?.name || '').localeCompare(b.job_types?.name || '')
  )

  const sortedJobTypes = [...jobTypes].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  )

  async function toggleJobType(jobTypeId: number) {
    const isActive = selectedJobTypes.some(
      (jobType) => jobType.job_type_id === jobTypeId
    )

    const response = await fetch('/api/toggle-job-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        job_type_id: jobTypeId,
        active: !isActive,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      return
    }

    if (isActive) {
      setSelectedJobTypes((prev) =>
        prev.filter((jobType) => jobType.job_type_id !== jobTypeId)
      )
    } else {
      const matchingType = jobTypes.find((type) => type.id === jobTypeId)

      setSelectedJobTypes((prev) => [
        ...prev,
        {
          id: `temp-${jobTypeId}`,
          job_id: jobId,
          job_type_id: jobTypeId,
          job_types: matchingType || null,
        },
      ])
    }
  }

  return (
    <div ref={dropdownRef} className="relative mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {sortedSelectedJobTypes.map((jobType: any) => (
          <button
            key={jobType.id}
            type="button"
            onClick={() => toggleJobType(jobType.job_type_id)}
            className={`px-3 py-1 rounded-full text-sm font-bold border hover:brightness-95 transition cursor-pointer ${getJobTypeClasses(
              jobType.job_types?.name
            )}`}
            title="Click to remove"
          >
            {jobType.job_types?.name}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-sm font-bold hover:bg-slate-200 transition cursor-pointer"
        >
          +
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-72">
          <div className="flex flex-col gap-1">
            {sortedJobTypes.map((jobType) => {
              const isActive = selectedJobTypes.some(
                (active) => active.job_type_id === jobType.id
              )

              return (
                <button
                  key={jobType.id}
                  type="button"
                  onClick={() => toggleJobType(jobType.id)}
                  className={`text-left px-3 py-2 rounded-xl text-sm transition ${
                    isActive
                      ? 'bg-slate-200 text-slate-900 font-bold'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  {isActive ? '✓ ' : ''}
                  {jobType.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}