import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import NewJobForm from './NewJobForm'
import PropertySelection from './PropertySelection'

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

  const selectedProperty = properties?.find(
    (property) => property.id === params.property_id
  )

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/jobs"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition mb-6"
        >
          ← Back to Jobs
        </Link>

        <div className="mb-8">
  <h1 className="text-4xl font-bold text-black">
    Add New Job
  </h1>

  {selectedProperty && (
    <p className="text-gray-600 mt-2">
      Complete the job details below.
    </p>
  )}
</div>

{!selectedProperty && (
  <PropertySelection properties={properties || []} />
)}

        {selectedProperty && (
          <div className="grid gap-6">

            <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-4">
                Selected Property
              </h2>

              <div className="grid gap-2">
                <p className="font-bold text-xl">
                  {selectedProperty.address_line_1}
                </p>

                {selectedProperty.address_line_2 && (
                  <p>{selectedProperty.address_line_2}</p>
                )}

                <p>
                  {selectedProperty.town}
                </p>

                <p className="text-gray-600">
                  {selectedProperty.postcode}
                </p>

                {selectedProperty.client && (
                  <p className="font-semibold text-gray-700 mt-2">
                    Client: {selectedProperty.client}
                  </p>
                )}
              </div>
            </div>

            <NewJobForm propertyId={selectedProperty.id} />

          </div>
        )}

      </div>
    </main>
  )
}