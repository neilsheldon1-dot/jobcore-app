'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [selectedBlockers, setSelectedBlockers] = useState<any[]>(
    currentBlockers || []
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

  async function toggleBlocker(blockerTypeId: number) {
    const isActive = selectedBlockers.some(
      (blocker) => blocker.blocker_type_id === blockerTypeId
    )

    const response = await fetch('/api/toggle-blocker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        blocker_type_id: blockerTypeId,
        active: !isActive,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      return
    }

    if (isActive) {
      setSelectedBlockers((prev) =>
        prev.filter((blocker) => blocker.blocker_type_id !== blockerTypeId)
      )
    } else {
      const matchingBlocker = blockerTypes.find(
        (blocker) => blocker.id === blockerTypeId
      )

      setSelectedBlockers((prev) => [
        ...prev,
        {
          id: `temp-${blockerTypeId}`,
          job_id: jobId,
          blocker_type_id: blockerTypeId,
          blocker_types: matchingBlocker || null,
        },
      ])
    }
  }

  return (
    <div ref={dropdownRef} className="relative mt-2">
      <div className="flex flex-wrap items-center gap-2">
        {selectedBlockers.map((blocker: any) => (
          <button
            key={blocker.id}
            type="button"
            onClick={() => toggleBlocker(blocker.blocker_type_id)}
            className="bg-amber-100 text-amber-800 border border-amber-300 px-3 py-1 rounded-full text-sm font-bold hover:bg-amber-200 transition cursor-pointer"
            title="Click to remove"
          >
            {blocker.blocker_types?.name}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="bg-amber-100 text-amber-700 border border-amber-300 px-3 py-1 rounded-full text-sm font-bold hover:bg-amber-200 transition cursor-pointer"
        >
          +
        </button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 w-72">
          <div className="flex flex-col gap-1">
            {blockerTypes.map((blocker) => {
              const isActive = selectedBlockers.some(
                (active) => active.blocker_type_id === blocker.id
              )

              return (
                <button
                  key={blocker.id}
                  type="button"
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