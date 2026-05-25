import Link from 'next/link'
import EditPropertyForm from './EditPropertyForm'
import { supabase } from '../../../../lib/supabase'

export const dynamic = 'force-dynamic'

type EditPropertyPageProps = {
  params: Promise<{
    propertyId: string
  }>
}

export default async function EditPropertyPage({
  params,
}: EditPropertyPageProps) {
  const { propertyId } = await params

  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .maybeSingle()

  const { data: zoneLocations } = await supabase
    .from('zone_locations')
    .select(`
      *,
      area_zones (
        name
      )
    `)
    .order('sort_order', { ascending: true })

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <h1 className="text-2xl font-bold">
          Property not found
        </h1>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-8">

        <Link
          href={`/properties/${property.id}`}
          className="text-blue-600 font-bold"
        >
          ← Back to Property
        </Link>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mt-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">
            Edit Property
          </h1>

          <EditPropertyForm
            property={property}
            zoneLocations={zoneLocations || []}
          />
        </section>

      </div>
    </main>
  )
}