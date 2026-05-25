import AppHeader from '../../../components/AppHeader'
import NewPropertyForm from '../../jobs/new/NewPropertyForm'
import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function NewPropertyPage() {
  const { data: zoneLocations } = await supabase
    .from('zone_locations')
    .select(`
      *,
      area_zones (
        name
      )
    `)
    .order('sort_order', { ascending: true })

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="properties" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900">
            Add New Property
          </h1>

          <p className="text-sm text-slate-500">
            Create a new property record in the JobCore database.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <NewPropertyForm zoneLocations={zoneLocations || []} />
      </div>
    </main>
  )
}