'use client'

import { useState } from 'react'

export default function BlockerDropdown({
  jobId,
  blockerTypes,
  currentBlockers,
}: {
  jobId: string
  blockerTypes: any[]
  currentBlockers: any[]
}) {
  const [open, setOpen] = useState(false)

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
    <div className="relative mt-2">
      <div
        onClick={() => setOpen(!open)}
        className="flex flex-wrap gap-2 cursor-pointer hover:brightness-95 transition"
      >
        {currentBlockers && currentBlockers.length > 0 ? (
          currentBlockers.map((blocker: any) => (
            <span
              key={blocker.id}
              className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-sm font-bold "
            >
              {blocker.blocker_types?.name}
            </span>
          ))
        ) : (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1 rounded-full text-sm font-bold">
            +
          </span>
        )}
      </div>

      {open && (
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
  )
}