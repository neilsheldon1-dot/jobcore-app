import AppHeader from '../../../components/AppHeader'
import QuickTicketForm from './QuickTicketForm'
import { supabase } from '../../../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function QuickTicketPage() {
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
      <AppHeader active="jobs" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-xl font-bold text-slate-900">
            Quick Ticket
          </h1>

          <p className="text-sm text-slate-500">
            Quickly create a new property and linked ticket in one step.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6">
        <QuickTicketForm zoneLocations={zoneLocations || []} />
      </div>
    </main>
  )
}