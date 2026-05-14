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
}

type PropertySelectionProps = {
  properties: Property[]
}

export default function PropertySelection({
  properties,
}: PropertySelectionProps) {
  const [showNewPropertyForm, setShowNewPropertyForm] = useState(false)

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

  {properties?.map((property) => (
    <Link
      key={property.id}
      href={`/jobs/new?property_id=${property.id}`}
      className="block border-b-0 md:border-b md:border-gray-200 bg-white hover:bg-gray-100 transition"
    >
      <div className="p-3 md:p-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
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
        </div>

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
        </div>
      </div>
    </Link>
  ))}
</div>

    
    </>
  )
}