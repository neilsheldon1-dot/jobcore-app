'use client'

export default function JobTypeButtons({
  jobId,
}: {
  jobId: string
}) {
  async function updateJobType(jobType: string) {
    const response = await fetch('/api/update-job-type', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        job_type: jobType,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Job Type Actions
      </h2>

      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => updateJobType('Reactive')}
          className="bg-lime-300 text-teal-800 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Reactive
        </button>

        <button
          onClick={() => updateJobType('Flat Roof')}
          className="bg-sky-400 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Flat Roof
        </button>

        <button
          onClick={() => updateJobType('Re Roof')}
          className="bg-amber-200 text-indigo-900 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Re Roof
        </button>

        <button
          onClick={() => updateJobType('Sika Roof')}
          className="bg-cyan-900 text-cyan-100 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Sika Roof
        </button>

        <button
          onClick={() => updateJobType('Roofline / EPS')}
          className="bg-orange-400 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Roofline / EPS
        </button>

        <button
          onClick={() => updateJobType('Hydro')}
          className="bg-blue-200 text-cyan-900 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Hydro
        </button>

        <button
          onClick={() => updateJobType('Scheme')}
          className="bg-amber-900 text-amber-200 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Scheme
        </button>
      </div>
    </div>
  )
}