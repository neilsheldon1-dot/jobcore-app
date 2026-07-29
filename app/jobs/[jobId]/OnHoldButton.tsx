'use client'

export default function OnHoldButton({
  jobId,
  isOnHold,
}: {
  jobId: string
  isOnHold: boolean | null
}) {
  async function updateOnHold(value: boolean) {
    const response = await fetch('/api/update-on-hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        is_on_hold: value,
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
    <label
      className={`flex items-center gap-3 border rounded-2xl px-5 py-1 cursor-pointer w-fit transition ${
        isOnHold
          ? 'bg-amber-500 border-amber-700'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <span
        className={`text-sm font-bold ${
          isOnHold ? 'text-white' : 'text-amber-800'
        }`}
      >
        {isOnHold ? 'On Hold' : 'Place On Hold?'}
      </span>

      <input
        type="checkbox"
        checked={!!isOnHold}
        onChange={(event) =>
          updateOnHold(event.target.checked)
        }
        className="h-5 w-5"
      />
    </label>
  )
}