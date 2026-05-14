import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import NewJobForm from './NewJobForm'
import PropertySelection from './PropertySelection'

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

  const selectedProperty = properties?.find(
    (property) => property.id === params.property_id
  )

  return (
    <main className="min-h-screen bg-blue-100">
      <div className="max-w-7xl mx-auto">

        <div className="sticky top-0 bg-blue-100 z-20 p-3 md:p-4">
          <h1 className="text-2xl md:text-4xl font-bold text-black">
            Add New Job
          </h1>

          {selectedProperty && (
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Complete the job details below.
            </p>
          )}
        </div>

        {!selectedProperty && (
          <PropertySelection properties={properties || []} />
        )}

        {selectedProperty && (
          <div className="grid gap-6 p-3 md:p-8">

            <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-6 md:p-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4">
                Selected Property
              </h2>

              <div className="grid gap-1 md:gap-2">
                <p className="font-bold text-base md:text-xl">
                  {selectedProperty.address_line_1}
                </p>

                {selectedProperty.address_line_2 && (
                  <p className="text-sm md:text-base">
                    {selectedProperty.address_line_2}
                  </p>
                )}

                <p className="text-sm md:text-base">
                  {selectedProperty.town}
                </p>

                <p className="text-sm md:text-base text-gray-600">
                  {selectedProperty.postcode}
                </p>

                {selectedProperty.client && (
                  <p className="text-sm md:text-base font-bold text-gray-700 mt-2">
                    Client: {selectedProperty.client}
                  </p>
                )}
              </div>
            </div>

            <NewJobForm propertyId={selectedProperty.id} />

          </div>
        )}

      </div>

      <Link
        href="/jobs"
        className="fixed bottom-6 left-6 z-50 bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
      >
        ← Jobs
      </Link>
    </main>
  )
}