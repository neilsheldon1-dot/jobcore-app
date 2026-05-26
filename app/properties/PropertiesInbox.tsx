'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function PropertiesInbox({
  properties,
}: {
  properties: any[]
}) {
  const [search, setSearch] = useState('')

  const filteredProperties = properties.filter((property) => {
    const searchText = search.toLowerCase()

    return [
      property.address_line_1,
      property.address_line_2,
      property.postcode,
      property.town,
      property.client,
      property.zone,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchText)
  })

  return (
    <>
      <div className="mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search address, postcode, client, town or zone..."
          className="w-full border border-gray-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b bg-slate-50 text-sm font-bold text-slate-600 uppercase tracking-wide">

          <div className="col-span-4">
            Address
          </div>

          <div className="col-span-2">
            Town
          </div>

          <div className="col-span-2">
            Postcode
          </div>

          <div className="col-span-2">
            Client
          </div>

          <div className="col-span-2">
            Zone
          </div>

        </div>

        <div className="divide-y">

          {filteredProperties.map((property) => (

            <Link
              key={property.id}
              href={`/properties/${property.id}`}
              className="grid grid-cols-12 gap-4 px-6 py-5 hover:bg-slate-50 transition text-sm items-center"
            >

              <div className="col-span-4 font-semibold text-slate-900">
                {property.address_line_1}
              </div>

              <div className="col-span-2 text-slate-700">
                {property.town || '-'}
              </div>

              <div className="col-span-2 text-slate-700">
                {property.postcode || '-'}
              </div>

              <div className="col-span-2">
                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                  {property.client || 'Unknown'}
                </span>
              </div>

              <div className="col-span-2 text-slate-600">
                {property.zone || '-'}
              </div>

            </Link>

          ))}

        </div>

      </div>
    </>
  )
}