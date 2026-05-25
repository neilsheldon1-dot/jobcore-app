'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function JobsInbox({
  jobs,
  blockerLinks,
  }: any) {
    
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
function getStatusColour(status: string) {
  switch (status) {
    case 'Ticket':
      return 'bg-pink-500'
    case 'Allocated':
      return 'bg-emerald-500'
    case 'Needs Quoting':
      return 'bg-purple-500'
    case 'Awaiting Approval':
      return 'bg-orange-500'
    case 'Ready':
      return 'bg-emerald-600'
    case 'Needs Invoicing':
      return 'bg-indigo-700'
    case 'Complete':
      return 'bg-green-700'
    default:
      return 'bg-slate-400'
  }
}

  function getStatusLetter(status: string) {
  switch (status) {
    case 'Ticket':
      return 'T'

    case 'Allocated':
      return '✓A'

    case 'Needs Quoting':
      return '£Q'

    case 'Awaiting Approval':
      return '?'

    case 'Ready':
      return '✓R'

    case 'Needs Invoicing':
      return '£i'

    case 'Complete':
      return '✅'

    default:
      return 'x'
  }
}

function getJobTypeStyle(jobType: string) {
  return jobType === 'Reactive'
    ? 'bg-lime-100 text-lime-800 border border-lime-200'
    : jobType === 'Flat Roof'
    ? 'bg-sky-100 text-sky-700 border border-sky-200'
    : jobType === 'Re Roof'
    ? 'bg-sky-400 text-white border border-blue-900'
    : jobType === 'Sika Roof'
    ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
    : jobType === 'Roofline / EPS'
    ? 'bg-orange-100 text-orange-700 border border-orange-200'
    : jobType === 'Hydro'
    ? 'bg-teal-100 text-teal-800 border border-teal-200'
    : jobType === 'Scheme'
    ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    : jobType === 'Planned'
    ? 'bg-green-200 text-green-700 border border-slate-200'
    : jobType === 'Slate / Tile Repair'
    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
    : jobType === 'Roof Repair'
    ? 'bg-violet-100 text-violet-700 border border-violet-200'
    : jobType === 'Gutter Work'
    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
    : jobType === 'Chimney'
    ? 'bg-rose-100 text-rose-700 border border-rose-200'
    : jobType === 'Lead Work'
    ? 'bg-zinc-300 text-zinc-900 border border-zinc-500'
    : jobType === 'Velux'
    ? 'bg-pink-100 text-black border border-pink-200'
    : jobType === 'Pointing'
    ? 'bg-stone-400 text-white border border-stone-300'
    : jobType === 'Fascia / Soffit'
    ? 'bg-purple-900 text-white border border-stone-300'
    : 'bg-slate-100 text-slate-700 border border-slate-200'
}
  function toggleJob(jobId: string) {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    )
  }

  function toggleAll() {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(jobs.map((job: any) => job.job_id))
    }
  }

  function printSelected() {
    const printUrl = `/jobs/print?ids=${selectedJobs.join(',')}`
    window.open(printUrl, '_blank')
  }

  return (
    <>
      {selectedJobs.length > 0 && (
        <div className="mb-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-700">
            {selectedJobs.length} selected
          </p>

          <button
            onClick={printSelected}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-blue-700 transition"
          >
            Print Selected
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
          <input
            type="checkbox"
            checked={
              jobs.length > 0 &&
              selectedJobs.length === jobs.length
            }
            onChange={toggleAll}
            className="h-4 w-4"
          />

          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Select All
          </p>
        </div>

        <div className="divide-y">
          {jobs.map((job: any) => {
            const jobBlockers =
              blockerLinks?.filter(
                (link: any) => link.job_id === job.job_id
              ) || []

            const jobHasBlockers =
              jobBlockers.length > 0

            return (
              <div
                key={job.job_id}
                className={`flex items-center gap-4 px-5 py-3 transition ${
                  job.urgent
                    ? 'bg-red-50 hover:bg-red-100'
                    : jobHasBlockers
                    ? 'bg-amber-50 hover:bg-amber-100'
                    : 'bg-white hover:bg-slate-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedJobs.includes(job.job_id)}
                  onChange={() => toggleJob(job.job_id)}
                  className="h-4 w-4 shrink-0"
                />

                <Link
                  href={`/jobs/${job.job_id}`}
                  className="flex items-center justify-between gap-4 flex-1 min-w-0"
                >
                  <div className="flex items-center gap-3 min-w-0">

                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getStatusColour(job.status)}`}
                    >
                      {getStatusLetter(job.status)}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">
                        {job.address_line_1}
                      </p>

                      <p className="text-xs text-slate-600 truncate">
                        {job.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getJobTypeStyle(job.job_type)}`}
                    >
                      {job.job_type}
                    </span>
{job.urgent && (
  <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
    URGENT
  </span>
)}
                    {jobBlockers.map((blocker: any, index: number) => (
                      <span
                        key={index}
                        className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold"
                      >
                        {blocker.blocker_types?.name}
                      </span>
                    ))}
                  </div>

                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}