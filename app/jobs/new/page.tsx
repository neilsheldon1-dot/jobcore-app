import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import NewJobForm from './NewJobForm'

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
          className="inline-block bg-black text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition mb-6"
        >
          ← Back to Jobs
        </Link>

        <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Add New Job
          </h1>

          <p className="text-gray-600">
            {selectedProperty
              ? 'Complete the job details below.'
              : 'Select a property to create a new live job.'}
          </p>
        </div>

        {!selectedProperty && (
          <div className="grid gap-4">

            {properties?.map((property) => (
              <Link
                key={property.id}
                href={`/jobs/new?property_id=${property.id}`}
                className="block bg-white border border-gray-200 rounded-2xl shadow hover:scale-[1.01] transition cursor-pointer"
              >
                <div className="p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <h2 className="text-xl font-bold text-black">
                        {property.address_line_1}
                      </h2>

                      {property.address_line_2 && (
                        <p className="text-gray-600">
                          {property.address_line_2}
                        </p>
                      )}

                      <p className="text-gray-600">
                        {property.town}
                      </p>

                      <p className="text-gray-500 mt-1">
                        {property.postcode}
                      </p>
                    </div>

                    <div className="text-right">

                      {property.client && (
                        <p className="font-semibold text-gray-700">
                          {property.client}
                        </p>
                      )}

                      {property.zone && (
                        <p className="text-sm text-gray-500">
                          Zone: {property.zone}
                        </p>
                      )}

                    </div>

                  </div>

                </div>
              </Link>
            ))}

          </div>
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