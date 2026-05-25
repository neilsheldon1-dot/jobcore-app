'use client'

import BlockerButtons from './BlockerButtons'

type WorkflowControlsProps = {
  jobId: string
  currentStatus: string
  currentJobType: string
  jobStatuses: any[]
  jobTypes: any[]
  blockerTypes: any[]
  activeBlockers: any[]
}

export default function WorkflowControls({
  jobId,
  currentStatus,
  currentJobType,
  jobStatuses,
  jobTypes,
  blockerTypes,
  activeBlockers,
}: WorkflowControlsProps) {
  async function updateStatus(status: string) {
    const response = await fetch('/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, status }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  async function updateJobType(jobType: string) {
    const response = await fetch('/api/update-job-type', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId, job_type: jobType }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">
          Workflow Controls
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Update the job status, work type and operational blockers.
        </p>
      </div>

      <div className="p-6 grid gap-8">

        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            Status
          </h3>

          <div className="flex flex-wrap gap-2">
            {jobStatuses.map((status) => {
              const isActive = currentStatus === status.name

              return (
                <button
                  key={status.id}
                  onClick={() => updateStatus(status.name)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                  }`}
                >
                  {status.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-700 mb-3">
            Job Type
          </h3>

          <div className="flex flex-wrap gap-2">
            {jobTypes.map((jobType) => {
              const isActive = currentJobType === jobType.name

              return (
                <button
                  key={jobType.id}
                  onClick={() => updateJobType(jobType.name)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-gray-300 hover:bg-slate-50'
                  }`}
                >
                  {jobType.name}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <BlockerButtons
            jobId={jobId}
            blockerTypes={blockerTypes}
            activeBlockers={activeBlockers}
          />
        </div>

      </div>
    </section>
  )
}