'use client'

import { useState } from 'react'

type EditJobDetailsFormProps = {
  job: any
}

export default function EditJobDetailsForm({ job }: EditJobDetailsFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)

    const response = await fetch('/api/update-job-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: job.job_id,
        job_number: formData.get('job_number'),
        po_number: formData.get('po_number'),
        quote_number: formData.get('quote_number'),
        description: formData.get('description'),
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      setIsSaving(false)
      return
    }

    window.location.reload()
  }

  if (!isEditing) {
    return (
      <button
        onClick={() => setIsEditing(true)}
        className="bg-blue-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
      >
        Edit Job Details
      </button>
    )
  }

  return (
    <form action={handleSubmit} className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 mt-6 grid gap-4">
      <h2 className="text-xl font-bold">
        Edit Job Details
      </h2>

      <input
        name="job_number"
        defaultValue={job.job_number || ''}
        placeholder="Job Number"
        className="border border-gray-300 rounded-xl p-3"
      />

      <input
        name="po_number"
        defaultValue={job.po_number || ''}
        placeholder="PO Number"
        className="border border-gray-300 rounded-xl p-3"
      />

      <input
        name="quote_number"
        defaultValue={job.quote_number || ''}
        placeholder="Quote Number"
        className="border border-gray-300 rounded-xl p-3"
      />

      <textarea
        name="description"
        defaultValue={job.description || ''}
        placeholder="Work Description"
        className="border border-gray-300 rounded-xl p-3 min-h-28"
      />

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}