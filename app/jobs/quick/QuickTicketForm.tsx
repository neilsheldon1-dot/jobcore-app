'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type ZoneLocation = {
  id: number
  location_name: string
  area_zones?: {
    name: string
  }
}

export default function QuickTicketForm({
  zoneLocations,
}: {
  zoneLocations: ZoneLocation[]
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsSaving(true)

    const response = await fetch('/api/quick-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address_line_1: formData.get('address_line_1'),
        address_line_2: formData.get('address_line_2'),
        town: formData.get('town'),
        postcode: formData.get('postcode'),
        client: formData.get('client'),
        zone: formData.get('zone'),
        tenant_contact: formData.get('tenant_contact'),
        description: formData.get('description'),
        urgent: formData.get('urgent') === 'on',
        job_number: formData.get('job_number'),
po_number: formData.get('po_number'),
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      setIsSaving(false)
      return
    }

    router.push(`/jobs/${result.job_id}`)
  }

  return (
    <form
      action={handleSubmit}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
    >
      <div className="px-5 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-slate-900">
          Ticket Input
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Add the minimum details needed to get the ticket onto JobCore.
        </p>
      </div>

      <div className="p-5 grid gap-5">
        <input name="address_line_1" required placeholder="Address Line 1" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
        <input name="address_line_2" placeholder="Address Line 2" className="w-full border border-gray-300 rounded-xl px-4 py-3" />

        <div className="grid md:grid-cols-2 gap-5">
          <input name="town" placeholder="Town" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
          <input name="postcode" placeholder="Postcode" className="w-full border border-gray-300 rounded-xl px-4 py-3" />
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          <select name="client" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white">
            <option value="">Select Client</option>
            <option value="Denbighshire">Denbighshire</option>
            <option value="Cartrefi">Cartrefi</option>
            <option value="Creating Enterprise">Creating Enterprise</option>
            <option value="Private">Private</option>
          </select>

          <select name="zone" className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white">
            <option value="">Select Zone / Area</option>

            {Object.entries(
              zoneLocations.reduce((groups: any, location: any) => {
                const zoneName = location.area_zones?.name || 'Other'
                if (!groups[zoneName]) groups[zoneName] = []
                groups[zoneName].push(location)
                return groups
              }, {})
            ).map(([zoneName, locations]: any) => (
              <optgroup key={zoneName} label={`──────── ${zoneName} ────────`}>
                {locations.map((location: any) => (
                  <option key={location.id} value={location.location_name}>
                    {location.location_name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
<div className="grid md:grid-cols-2 gap-5">
  <input
    name="job_number"
    placeholder="Job number"
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
  />

  <input
    name="po_number"
    placeholder="PO number"
    className="w-full border border-gray-300 rounded-xl px-4 py-3"
  />
</div>
        <input name="tenant_contact" placeholder="Tenant contact details" className="w-full border border-gray-300 rounded-xl px-4 py-3" />

        <textarea
          name="description"
          required
          placeholder="Work description from ticket/email..."
          className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-32"
        />

        <label className="flex items-center justify-between gap-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 cursor-pointer">
          <span className="font-bold text-red-700">
            Mark as urgent
          </span>

          <input type="checkbox" name="urgent" className="h-5 w-5" />
        </label>

        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isSaving ? 'Creating Ticket...' : 'Create Quick Ticket'}
        </button>
      </div>
    </form>
  )
}