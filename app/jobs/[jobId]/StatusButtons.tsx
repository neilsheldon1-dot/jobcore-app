'use client'

export default function StatusButtons({
  jobId,
}: {
  jobId: string
}) {
  async function updateStatus(status: string) {
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_id: jobId,
        status,
      }),
    })

    const result = await response.json()

    
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-6">Workflow Actions</h2>

      <div className="flex flex-wrap gap-4">
        <button
        onClick={() => updateStatus('Ticket')}
        className="bg-pink-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
         Ticket
        </button>
        
        <button
          onClick={() => updateStatus('Needs Quoting')}
          className="bg-purple-300 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Needs Quote
        </button>

        <button
          onClick={() => updateStatus('Awaiting Approval')}
          className="bg-orange-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Awaiting Approval
        </button>

        <button
          onClick={() => updateStatus('Awaiting Scaffolding')}
          className="bg-red-900 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Awaiting Scaffold
        </button>

        <button
          onClick={() => updateStatus('Ready')}
          className="bg-emerald-200 text-emerald-800 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Ready
        </button>

        <button
          onClick={() => updateStatus('Scaffold Ready')}
          className="bg-green-900 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Scaffold Up
        </button>

        <button
          onClick={() => updateStatus('Needs Invoicing')}
          className="bg-blue-900 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
        >
          Needs Invoice
        </button>

        <button
          onClick={() => updateStatus('Awaiting Asbestos Removal')}
         className="bg-sky-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
         Awaiting Asbestos Removal
        </button>

        <button
         onClick={() => updateStatus('Awaiting Gas Engineer')}
        className="bg-yellow-700 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
        Awaiting Gas Engineer
        </button>

        <button
        onClick={() => updateStatus('Awaiting Solar Contractor')}
        className="bg-yellow-300 text-black px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
        Awaiting Solar Contractor
        </button>

        <button
         onClick={() => updateStatus('Awaiting TV Contractor')}
        className="bg-zinc-600 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
        Awaiting TV Contractor
        </button>

        <button
         onClick={() => updateStatus('Awaiting Materials')}
        className="bg-purple-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
        Awaiting Materials
        </button>

        <button
        onClick={() => updateStatus('Access Issue')}
        className="bg-teal-400 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
>
        Access Issues
        </button>
      
      </div>
    </div>
  )
}