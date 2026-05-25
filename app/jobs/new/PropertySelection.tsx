'use client'

import { useState } from 'react'
import Link from 'next/link'

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
  const [search, setSearch] = useState('')

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase()

    return [
      property.address_line_1,
      property.address_line_2,
      property.town,
      property.postcode,
      property.client,
      property.zone,
      property.tenant_contact,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchText)
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">
          Select Property
        </h2>

        <Link
          href="/properties/new"
          className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition shrink-0"
        >
          + Add New Property
        </Link>
      </div>

      <div className="p-4 border-b border-gray-200">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address, postcode, client, town or zone..."
          className="w-full border border-gray-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="divide-y">
        {filteredProperties.length > 0 ? (
          filteredProperties.map((property) => (
            <Link
              key={property.id}
              href={`/jobs/new?property_id=${property.id}`}
              className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-slate-50 transition"
            >
              <div className="min-w-0">
                <p className="font-semibold text-sm text-slate-900 truncate">
                  {property.address_line_1}
                </p>

                <p className="text-xs text-slate-600 mt-1 truncate">
                  {[property.address_line_2, property.town, property.postcode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>

              <div className="flex flex-wrap justify-end gap-2 shrink-0">
                {property.client && (
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {property.client}
                  </span>
                )}

                {property.zone && (
                  <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {property.zone}
                  </span>
                )}
              </div>
            </Link>
          ))
        ) : (
          <div className="px-5 py-6 text-sm text-slate-500">
            No matching properties found.
          </div>
        )}
      </div>
    </div>
  )
}