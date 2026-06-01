'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type JobStatus = {
  id: number
  name: string
}

type JobType = {
  id: number
  name: string
}

type NewJobFormProps = {
  propertyId: string
  jobStatuses: JobStatus[]
  jobTypes: JobType[]
}

export default function NewJobForm({
  propertyId,
  jobStatuses,
  jobTypes,
}: NewJobFormProps) {
  const router = useRouter()

  const [description, setDescription] = useState('')
  const [jobTypeId, setJobTypeId] = useState(jobTypes?.[0]?.id?.toString() || '')
  const [statusId, setStatusId] = useState(jobStatuses?.[0]?.id?.toString() || '')
  const [jobNumber, setJobNumber] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [urgent, setUrgent] = useState(false)
  const [isSaving, setIsSaving] = useState(false)



  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSaving(true)

    const response = await fetch('/api/create-job', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        property_id: propertyId,
        description,
        job_type_id: jobTypeId,
        status_id: statusId,
        urgent,
        job_number: jobNumber,
        po_number: poNumber,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      setIsSaving(false)
      return
    }

    router.push(`/jobs/${result.id}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-slate-900">
          Job Details
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Add the core job information and initial workflow state.
        </p>
      </div>

      <div className="p-5 grid gap-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Job Description
          </label>

          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe the work required..."
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Status
            </label>

            <select
              value={statusId}
              onChange={(event) => setStatusId(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobStatuses.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Job Type
            </label>

            <select
              value={jobTypeId}
              onChange={(event) => setJobTypeId(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobTypes.map((jobType) => (
                <option key={jobType.id} value={jobType.id}>
                  {jobType.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Job Number
            </label>

            <input
              value={jobNumber}
              onChange={(event) => setJobNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              PO Number
            </label>

            <input
              value={poNumber}
              onChange={(event) => setPoNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional"
            />
          </div>
        </div>

        <label className="flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 cursor-pointer">
          <div>
            <p className="font-bold text-red-700">
              Mark as urgent
            </p>

            <p className="text-xs text-red-600">
              Highlight this job in the live inbox.
            </p>
          </div>

          <input
            type="checkbox"
            checked={urgent}
            onChange={(event) => setUrgent(event.target.checked)}
            className="h-5 w-5"
          />
        </label>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Creating Job...' : 'Create Job'}
          </button>
        </div>
      </div>
    </form>
  )
}

 