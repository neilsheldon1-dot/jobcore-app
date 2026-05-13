'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type NewJobFormProps = {
  propertyId: string
}

export default function NewJobForm({ propertyId }: NewJobFormProps) {
  const router = useRouter()

  const [description, setDescription] = useState('')
  const [jobTypeId, setJobTypeId] = useState('1')
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
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6">
        Job Details
      </h2>

      <div className="grid gap-5">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="w-full border border-gray-300 rounded-2xl p-4 min-h-32"
            placeholder="Describe the work required..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Job Type
          </label>
          <select
            value={jobTypeId}
            onChange={(event) => setJobTypeId(event.target.value)}
            className="w-full border border-gray-300 rounded-2xl p-4"
          >
            <option value="1">Reactive</option>
            <option value="2">Planned</option>
            <option value="3">Sika Roof</option>
            <option value="4">Roofline / EPS</option>
            <option value="5">Hydro</option>
            <option value="6">Re Roof</option>
            <option value="7">Scheme</option>
            <option value="8">Flat Roof</option>
          </select>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Job Number
            </label>
            <input
              value={jobNumber}
              onChange={(event) => setJobNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-4"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              PO Number
            </label>
            <input
              value={poNumber}
              onChange={(event) => setPoNumber(event.target.value)}
              className="w-full border border-gray-300 rounded-2xl p-4"
              placeholder="Optional"
            />
          </div>
        </div>

        <label className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={urgent}
            onChange={(event) => setUrgent(event.target.checked)}
            className="h-5 w-5"
          />
          <span className="font-bold text-red-700">
            Mark as urgent
          </span>
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? 'Creating Job...' : 'Create Job'}
        </button>
      </div>
    </form>
  )
}