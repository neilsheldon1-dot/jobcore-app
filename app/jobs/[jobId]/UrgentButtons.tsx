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
    <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4">Urgency</h2>

      <p className="mb-4">
        Current urgent status:{' '}
        <span className={urgent ? 'font-bold text-red-600' : 'font-bold text-gray-600'}>
          {urgent ? 'Urgent' : 'Normal'}
        </span>
      </p>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => updateUrgent(true)}
          className="bg-red-600 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Mark Urgent
        </button>

        <button
          onClick={() => updateUrgent(false)}
          className="bg-gray-700 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Normal
        </button>
      </div>
    </div>
  )
}