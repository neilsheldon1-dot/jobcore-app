import Link from 'next/link'
import AppHeader from '../../components/AppHeader'
import { supabase } from '../../lib/supabase'
import PropertiesInbox from './PropertiesInbox'

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
const propertyCount = properties?.length || 0

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

<p className="text-sm font-bold text-blue-700 mt-1">
  Total number of properties in database: {propertyCount}
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
        <PropertiesInbox properties={properties || []} />
      </div>

    </main>
  )
}