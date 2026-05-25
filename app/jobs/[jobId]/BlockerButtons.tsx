'use client'

type BlockerType = {
  id: number
  name: string
  colour?: string
}

type ActiveBlocker = {
  blocker_type_id: number
}

type BlockerButtonsProps = {
  jobId: string
  blockerTypes: BlockerType[]
  activeBlockers: ActiveBlocker[]
}

export default function BlockerButtons({
  jobId,
  blockerTypes,
  activeBlockers,
}: BlockerButtonsProps) {
  async function toggleBlocker(blockerTypeId: number) {
    const isActive = activeBlockers.some(
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

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 mb-3">
        Blockers / Dependencies
      </h3>

      <div className="flex flex-wrap gap-3">
        {blockerTypes.map((blocker) => {
          const isActive = activeBlockers.some(
            (activeBlocker) =>
              activeBlocker.blocker_type_id === blocker.id
          )

          return (
            <button
              key={blocker.id}
              type="button"
              onClick={() => toggleBlocker(blocker.id)}
              className={`px-4 py-2 rounded-full text-sm font-bold border transition hover:scale-105 active:scale-95 ${
                isActive
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-gray-100 text-gray-700 border-gray-200'
              }`}
            >
              {blocker.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}