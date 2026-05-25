'use client'

import { useState } from 'react'

type JobStateControlsProps = {
  jobId: string
  currentStatus: string
  currentJobType: string
  currentBlockers: any[]
  jobStatuses: any[]
  jobTypes: any[]
  blockerTypes: any[]
}

export default function JobStateControls({
  jobId,
  currentStatus,
  currentJobType,
  currentBlockers,
  jobStatuses,
  jobTypes,
  blockerTypes,
}: JobStateControlsProps) {
  const [showStatus, setShowStatus] = useState(false)
  const [showType, setShowType] = useState(false)
  const [showBlockers, setShowBlockers] = useState(false)

  async function updateStatus(status: string) {
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

  async function updateJobType(jobType: string) {
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

  async function toggleBlocker(blockerTypeId: number) {
    const isActive = currentBlockers.some(
      (blocker) => blocker.blocker_type_id === blockerTypeId
    )

    await fetch('/api/toggle-blocker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        blocker_type_id: blockerTypeId,
        active: !isActive,
      }),
    })

    window.location.reload()
  }

  return (
    <div className="border-t mt-6 pt-6">

      <div className="flex flex-wrap gap-3">

        <div className="relative">
          <button
            onClick={() => {
              setShowStatus(!showStatus)
              setShowType(false)
              setShowBlockers(false)
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            Change Status
          </button>

          {showStatus && (
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

        <div className="relative">
          <button
            onClick={() => {
              setShowType(!showType)
              setShowStatus(false)
              setShowBlockers(false)
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            Change Type
          </button>

          {showType && (
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

        <div className="relative">
          <button
            onClick={() => {
              setShowBlockers(!showBlockers)
              setShowStatus(false)
              setShowType(false)
            }}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition"
          >
            Manage Blockers
          </button>

          {showBlockers && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-72">
              <div className="flex flex-col gap-1">
                {blockerTypes.map((blocker) => {
                  const isActive = currentBlockers.some(
                    (active) => active.blocker_type_id === blocker.id
                  )

                  return (
                    <button
                      key={blocker.id}
                      onClick={() => toggleBlocker(blocker.id)}
                      className={`text-left px-3 py-2 rounded-xl text-sm transition ${
                        isActive
                          ? 'bg-amber-100 text-amber-800 font-bold'
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {isActive ? '✓ ' : ''}
                      {blocker.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}