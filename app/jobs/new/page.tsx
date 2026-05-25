import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import NewJobForm from './NewJobForm'
import PropertySelection from './PropertySelection'
import AppHeader from '../../../components/AppHeader'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  property_id?: string
}>

export default async function NewJobPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('address_line_1', { ascending: true })

  const { data: zoneLocations } = await supabase
    .from('zone_locations')
    .select(`
      *,
      area_zones (
        name
      )
    `)
    .order('sort_order', { ascending: true })

  const { data: jobStatuses } = await supabase
    .from('job_statuses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const { data: jobTypes } = await supabase
    .from('job_types')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true })

  const selectedProperty = properties?.find(
    (property) => property.id === params.property_id
  )

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Add New Job
            </h1>

            <p className="text-sm text-slate-500">
              {selectedProperty
                ? 'Complete the job details for the selected property.'
                : 'Select an existing property or add a new one to begin.'}
            </p>
          </div>

          <Link
            href="/jobs"
            className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
          >
            ← Back to Jobs
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {!selectedProperty && (
          <PropertySelection properties={properties || []} />
        )}

        {selectedProperty && (
          <div className="grid gap-5">

            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">
                    Selected Property
                  </p>

                  <h2 className="text-xl font-semibold text-slate-900 mt-1">
                    {selectedProperty.address_line_1}
                  </h2>

                  {selectedProperty.address_line_2 && (
                    <p className="text-sm text-slate-600 mt-1">
                      {selectedProperty.address_line_2}
                    </p>
                  )}

                  <p className="text-sm text-slate-600">
                    {selectedProperty.town} {selectedProperty.postcode}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedProperty.client && (
                      <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                        {selectedProperty.client}
                      </span>
                    )}

                    {selectedProperty.zone && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                        {selectedProperty.zone}
                      </span>
                    )}
                  </div>
                </div>

                <Link
                  href="/jobs/new"
                  className="text-sm font-bold text-blue-600 hover:text-blue-800"
                >
                  Change Property
                </Link>
              </div>
            </section>

            <NewJobForm
              propertyId={selectedProperty.id}
              jobStatuses={jobStatuses || []}
              jobTypes={jobTypes || []}
            />

          </div>
        )}

      </div>
    </main>
  )
}