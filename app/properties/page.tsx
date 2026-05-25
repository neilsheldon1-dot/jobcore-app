import Link from 'next/link'
import AppHeader from '../../components/AppHeader'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  search?: string
}>

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  let query = supabase
  .from('properties')
  .select('*')
  .order('zone', { ascending: true })
  .order('postcode', { ascending: true })
  .order('address_line_1', { ascending: true })

if (params.search) {
  query = query.or(
    `address_line_1.ilike.%${params.search}%,address_line_2.ilike.%${params.search}%,postcode.ilike.%${params.search}%,town.ilike.%${params.search}%,client.ilike.%${params.search}%,zone.ilike.%${params.search}%`
  )
}

const { data: properties } = await query

  return (
    <main className="min-h-screen bg-slate-100">

      {/* Top nav */}
      <AppHeader active="properties" />

      {/* Banner */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Properties
            </h1>

            <p className="text-sm text-slate-500">
              Property database and operational locations
            </p>
          </div>

          <Link
            href="/properties/new"
            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-sm"
          >
            + Add Property
          </Link>

        </div>
      </div>

      {/* Property List */}
      <div className="max-w-7xl mx-auto px-6 py-8">
<form action="/properties" className="mb-6">
  <input
    type="text"
    name="search"
    defaultValue={params.search || ''}
    placeholder="Search address, postcode, client, town or zone..."
    className="w-full border border-gray-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
  />
</form>
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

            {properties?.map((property) => (

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

      </div>

    </main>
  )
}