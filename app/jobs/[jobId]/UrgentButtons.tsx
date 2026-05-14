'use client'

export default function UrgentButtons({
  jobId,
  urgent,
}: {
  jobId: string
  urgent: boolean | null
}) {
  async function updateUrgent(value: boolean) {
    const response = await fetch('/api/update-urgent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        urgent: value,
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
    className={`flex items-center gap-3 border rounded-2xl px-4 py-3 cursor-pointer w-fit transition ${
      urgent
        ? 'bg-red-500 border-red-700'
        : 'bg-red-50 border-red-200'
    }`}
  >
    <span
      className={`text-sm font-bold ${
        urgent ? 'text-white' : 'text-red-700'
      }`}
    >
      Mark as urgent?
    </span>

    <input
      type="checkbox"
      checked={!!urgent}
      onChange={(event) => updateUrgent(event.target.checked)}
      className="h-5 w-5"
    />
  </label>
)
}