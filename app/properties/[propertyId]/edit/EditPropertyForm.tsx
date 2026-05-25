'use client'

import { useRouter } from 'next/navigation'

type ZoneLocation = {
  id: number
  location_name: string
  area_zone_id: number
  area_zones?: {
    name: string
  }
}

export default function EditPropertyForm({
  property,
  zoneLocations,
}: {
  property: any
  zoneLocations: ZoneLocation[]
}) {
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    const response = await fetch('/api/update-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: property.id,
        address_line_1: formData.get('address_line_1'),
        address_line_2: formData.get('address_line_2'),
        town: formData.get('town'),
        postcode: formData.get('postcode'),
        client: formData.get('client'),
        zone: formData.get('zone'),
        tenant_contact: formData.get('tenant_contact'),
        notes: formData.get('notes'),
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    router.push(`/properties/${property.id}`)
    router.refresh()
  }

  return (
  <form action={handleSubmit} className="grid gap-5">

    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        Address Line 1
      </label>
      <input
        name="address_line_1"
        defaultValue={property.address_line_1 || ''}
        placeholder="Address Line 1"
        className="w-full border border-gray-300 rounded-xl px-4 py-3"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        Address Line 2
      </label>
      <input
        name="address_line_2"
        defaultValue={property.address_line_2 || ''}
        placeholder="Address Line 2"
        className="w-full border border-gray-300 rounded-xl px-4 py-3"
      />
    </div>

    <div className="grid grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Town
        </label>
        <input
          name="town"
          defaultValue={property.town || ''}
          placeholder="Town"
          className="w-full border border-gray-300 rounded-xl px-4 py-3"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Postcode
        </label>
        <input
          name="postcode"
          defaultValue={property.postcode || ''}
          placeholder="Postcode"
          className="w-full border border-gray-300 rounded-xl px-4 py-3"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-5">
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Client
        </label>
        <select
          name="client"
          defaultValue={property.client || ''}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
        >
          <option value="">Select Client</option>
          <option value="Cartrefi">Cartrefi</option>
          <option value="Denbighshire">Denbighshire</option>
          <option value="Creating Enterprise">Creating Enterprise</option>
          <option value="Private">Private</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">
          Zone / Area
        </label>
        <select
          name="zone"
          defaultValue={property.zone || ''}
          className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white"
        >
          <option value="">Select Area / Town</option>

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
    </div>

    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        Tenant Contact
      </label>
      <input
        name="tenant_contact"
        defaultValue={property.tenant_contact || ''}
        placeholder="Tenant contact details"
        className="w-full border border-gray-300 rounded-xl px-4 py-3"
      />
    </div>

    <div>
      <label className="block text-sm font-bold text-slate-700 mb-2">
        Property Notes
      </label>
      <textarea
        name="notes"
        defaultValue={property.notes || ''}
        placeholder="Add any useful property notes here..."
        className="w-full border border-gray-300 rounded-xl px-4 py-3 min-h-32"
      />
    </div>

    <button className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition">
      Save Property
    </button>

  </form>
)
}