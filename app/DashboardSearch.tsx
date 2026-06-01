'use client'

import { useState } from 'react'
import Link from 'next/link'

function getHouseNumber(address: string) {
  const match = address?.match(/\d+/)
  return match ? Number(match[0]) : 999999
}

export default function DashboardSearch({ jobs }: { jobs: any[] }) {
  const [search, setSearch] = useState('')

  const results = jobs
    .filter((job) => {
      const searchText = search.toLowerCase()

      return [
        job.job_number,
        job.address_line_1,
        job.town,
        job.postcode,
        job.client,
        job.description,
        job.status,
        job.job_type,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchText)
    })
    .sort((a, b) => {
      const addressA = a.address_line_1 || ''
      const addressB = b.address_line_1 || ''

      const numberA = getHouseNumber(addressA)
      const numberB = getHouseNumber(addressB)

      if (numberA !== numberB) {
        return numberA - numberB
      }

      return addressA.localeCompare(addressB)
    })

  return (
    <div className="mb-8">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search jobs, addresses, postcodes, clients or job numbers..."
        className="w-full border border-gray-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {search && (
        <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {results.length > 0 ? (
            results.slice(0, 10).map((job) => (
              <Link
                key={job.job_id}
                href={`/jobs/${job.job_id}`}
                className="block px-5 py-3 border-b last:border-b-0 hover:bg-slate-50 transition"
              >
                <p className="font-semibold text-sm text-slate-900">
                  {job.address_line_1}
                </p>


                <p className="text-xs text-slate-600">
                  {job.job_number || 'No job number'} • {job.status}
                </p>
              </Link>
            ))
          ) : (
            <p className="px-5 py-4 text-sm text-slate-500">
              No matching jobs found.
            </p>
          )}
        </div>
      )}
    </div>
  )
}