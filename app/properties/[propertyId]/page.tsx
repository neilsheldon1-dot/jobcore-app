import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import DeletePropertyButton from './DeletePropertyButton'

export const dynamic = 'force-dynamic'

type PropertyPageProps = {
  params: Promise<{
    propertyId: string
  }>
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { propertyId } = await params

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .maybeSingle()

  const { data: jobs } = await supabase
    .from('jobs_view')
    .select('*')
    .eq('property_id', propertyId)
    .order('created_at', { ascending: false })

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <h1 className="text-2xl font-bold">Property not found</h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-8">

        <Link href="/properties" className="text-blue-600 font-bold">
          ← Back to Properties
        </Link>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {property.address_line_1}
          </h1>

          <p className="text-slate-600 mt-1">
            {property.address_line_2}
          </p>

          <p className="text-slate-600">
            {property.town} {property.postcode}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
              {property.client || 'Unknown Client'}
            </span>

            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
              {property.zone || 'No Zone'}
            </span>
          </div>

          {property.tenant_contact && (
            <p className="text-sm text-slate-600 mt-4">
              <span className="font-bold">Tenant Contact:</span> {property.tenant_contact}
            </p>
          )}

          {property.notes && (
            <p className="text-sm text-slate-600 mt-2">
              <span className="font-bold">Notes:</span> {property.notes}
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">

  <Link
    href={`/jobs/new?property_id=${property.id}`}
    className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
  >
    + Add Job For This Property
  </Link>

  <Link
    href={`/properties/${property.id}/edit`}
    className="bg-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-300 transition"
  >
    Edit Property
  </Link>
<DeletePropertyButton propertyId={property.id} />
</div>
 </section>
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-6">
          <div className="px-6 py-5 border-b">
            <h2 className="text-lg font-bold text-slate-900">
              Job History
            </h2>
          </div>

          <div className="divide-y">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="block px-6 py-4 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-slate-900">
                        {job.job_number || 'No Job Number'}
                      </p>

                      <div className="mt-1 space-y-1">

  <p className="text-sm text-slate-600">
    {job.description || 'No description'}
  </p>

  <p className="text-xs text-slate-400">
    {new Date(job.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })}
  </p>

</div>
                    </div>

                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold">
                      {job.status}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <p className="px-6 py-5 text-sm text-slate-500">
                No jobs recorded for this property yet.
              </p>
            )}
          </div>
        </section>

      </div>
    </main>
  )
}