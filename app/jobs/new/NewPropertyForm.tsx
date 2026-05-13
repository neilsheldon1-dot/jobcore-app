'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type NewPropertyFormProps = {
  onCancel?: () => void
}

export default function NewPropertyForm({
  onCancel,
}: NewPropertyFormProps) {
  const router = useRouter()

  const [address1, setAddress1] = useState('')
  const [address2, setAddress2] = useState('')
  const [town, setTown] = useState('')
  const [postcode, setPostcode] = useState('')
  const [client, setClient] = useState('')
  const [zone, setZone] = useState('')
  const [tenantContact, setTenantContact] = useState('')
  const [notes, setNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSaving(true)

    const response = await fetch('/api/create-property', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address_line_1: address1,
        address_line_2: address2,
        town,
        postcode,
        client,
        zone,
        tenant_contact: tenantContact,
        notes,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(JSON.stringify(result, null, 2))
      setIsSaving(false)
      return
    }

    router.push(`/jobs/new?property_id=${result.id}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 mb-8"
    >
      <h2 className="text-2xl font-bold mb-6">
        Add New Property
      </h2>

      <div className="grid gap-5">

        <input
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          placeholder="Address Line 1"
          className="border border-gray-300 rounded-2xl p-4"
          required
        />

        <input
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          placeholder="Address Line 2"
          className="border border-gray-300 rounded-2xl p-4"
        />

        <div className="grid md:grid-cols-2 gap-5">

          <input
            value={town}
            onChange={(e) => setTown(e.target.value)}
            placeholder="Town"
            className="border border-gray-300 rounded-2xl p-4"
            required
          />

          <input
            value={postcode}
            onChange={(e) => setPostcode(e.target.value)}
            placeholder="Postcode"
            className="border border-gray-300 rounded-2xl p-4"
            required
          />

        </div>

        <div className="grid md:grid-cols-2 gap-5">

          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="border border-gray-300 rounded-2xl p-4"
          >
            <option value="">Select Client</option>
            <option value="Cartrefi">Cartrefi</option>
            <option value="Denbighshire">Denbighshire</option>
            <option value="Creating Enterprise">Creating Enterprise</option>
            <option value="Private">Private</option>
          </select>

          <input
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            placeholder="Zone"
            className="border border-gray-300 rounded-2xl p-4"
          />

        </div>

        <input
          value={tenantContact}
          onChange={(e) => setTenantContact(e.target.value)}
          placeholder="Tenant Contact"
          className="border border-gray-300 rounded-2xl p-4"
        />

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Property notes"
          className="border border-gray-300 rounded-2xl p-4 min-h-28"
        />
{onCancel && (
  <button
    type="button"
    onClick={onCancel}
    className="bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition cursor-pointer"
  >
    Cancel
  </button>
)}
        <button
          type="submit"
          disabled={isSaving}
          className="bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-50"
        >
          {isSaving ? 'Creating Property...' : 'Submit Property'}
        </button>

      </div>
    </form>
  )
}