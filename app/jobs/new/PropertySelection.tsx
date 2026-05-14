'use client'

import { useState } from 'react'
import Link from 'next/link'
import NewPropertyForm from './NewPropertyForm'

type Property = {
  id: string
  address_line_1: string
  address_line_2?: string
  town?: string
  postcode?: string
  client?: string
  zone?: string
  tenant_contact?: string
}

type PropertySelectionProps = {
  properties: Property[]
}

export default function PropertySelection({
  properties,
}: PropertySelectionProps) {
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false)
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null)
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null)

  async function updateProperty(property: Property, formData: FormData) {
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
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  async function deleteProperty(propertyId: string) {
    const response = await fetch('/api/delete-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result, null, 2))
      return
    }

    window.location.reload()
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 mb-6">
        <p className="text-gray-600">
          Select a property below or add a new property to continue.
        </p>
      </div>

      {showNewPropertyForm && (
        <NewPropertyForm
          onCancel={() => setShowNewPropertyForm(false)}
        />
      )}

      <div className="bg-white">
        {!showNewPropertyForm && (
          <button
            onClick={() => setShowNewPropertyForm(true)}
            className="fixed bottom-6 right-6 z-50 bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
          >
            + Add New Property
          </button>
        )}

        {properties?.map((property) => {
          const isEditing = editingPropertyId === property.id
          const isConfirmingDelete = deletePropertyId === property.id

          return (
            <div
              key={property.id}
              className="border-b-0 md:border-b md:border-gray-200 bg-white hover:bg-gray-100 transition"
            >
              {isEditing ? (
                <form
                  action={(formData) => updateProperty(property, formData)}
                  className="p-3 md:p-4 grid gap-3"
                >
                  <input
                    name="address_line_1"
                    defaultValue={property.address_line_1}
                    className="border border-gray-300 rounded-xl p-3 font-bold"
                    required
                  />

                  <input
                    name="address_line_2"
                    defaultValue={property.address_line_2 || ''}
                    className="border border-gray-300 rounded-xl p-3"
                    placeholder="Address Line 2"
                  />

                  <div className="grid md:grid-cols-2 gap-3">
                    <input
                      name="town"
                      defaultValue={property.town || ''}
                      className="border border-gray-300 rounded-xl p-3"
                      placeholder="Town"
                    />

                    <input
                      name="postcode"
                      defaultValue={property.postcode || ''}
                      className="border border-gray-300 rounded-xl p-3"
                      placeholder="Postcode"
                    />
                  </div>

                 <div className="grid md:grid-cols-2 gap-3">
  <select
    name="client"
    defaultValue={property.client || ''}
    className="border border-gray-300 rounded-xl p-3"
  >
    <option value="">Select Client</option>
    <option value="Cartrefi">Cartrefi</option>
    <option value="Denbighshire">Denbighshire</option>
    <option value="Creating Enterprise">Creating Enterprise</option>
    <option value="Private">Private</option>
  </select>

  <input
    name="zone"
    defaultValue={property.zone || ''}
    className="border border-gray-300 rounded-xl p-3"
    placeholder="Zone"
  />
</div>

<input
  name="tenant_contact"
  defaultValue={property.tenant_contact || ''}
  className="border border-gray-300 rounded-xl p-3"
  placeholder="Tenant Contact"
/>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      className="bg-blue-500 text-white px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition"
                    >
                      Save Changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingPropertyId(null)}
                      className="bg-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 md:p-4 flex items-start justify-between gap-4">
                  <Link
                    href={`/jobs/new?property_id=${property.id}`}
                    className="flex-1 min-w-0"
                  >
                    <h2 className="font-bold text-base md:text-lg truncate">
                      {property.address_line_1}
                    </h2>

                    {property.address_line_2 && (
                      <p className="text-sm md:text-base text-gray-600 truncate">
                        {property.address_line_2}
                      </p>
                    )}

                    <p className="text-sm md:text-base text-gray-600">
                      {property.town}
                    </p>

                    <p className="text-sm text-gray-500 mt-0.5">
                      {property.postcode}
                    </p>
                  </Link>

                  <div className="text-right shrink-0">
                    {property.client && (
                      <p className="text-sm text-gray-700 font-bold">
                        {property.client}
                      </p>
                    )}

                    {property.zone && (
                      <p className="text-xs text-gray-500 mt-1">
                        Zone: {property.zone}
                      </p>
                    )}

                    <div className="flex gap-2 justify-end mt-3">
                      <button
                        type="button"
                        onClick={() => setEditingPropertyId(property.id)}
                        className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Amend
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletePropertyId(property.id)}
                        className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                      >
                        Delete
                      </button>
                    </div>

                    {isConfirmingDelete && (
                      <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 text-left max-w-xs">
                        <p className="text-sm font-bold text-red-700">
                          Are you sure?
                        </p>

                        <p className="text-xs text-red-600 mt-1">
                          This will permanently delete this property and any linked test jobs. This cannot be undone.
                        </p>

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={() => setDeletePropertyId(null)}
                            className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteProperty(property.id)}
                            className="bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                          >
                            Confirm Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}