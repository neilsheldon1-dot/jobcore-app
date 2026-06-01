import AppHeader from '../../components/AppHeader'
import { supabase } from '../../lib/supabase'
import JobsInbox from '../jobs/JobsInbox'

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  const { data: jobs } = await supabase
    .from('jobs_view')
    .select('*')
    .eq('status', 'Complete')
    .order('created_at', { ascending: false })

  const { data: blockerLinks } = await supabase
    .from('job_blocker_links')
    .select(`
      job_id,
      blocker_types (
        name
      )
    `)

  const { data: jobTypeLinks } = await supabase
    .from('job_type_links')
    .select(`
      id,
      job_id,
      job_type_id,
      job_types (
        name
      )
    `)

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="archive" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Archive
          </h1>

          <p className="text-sm text-slate-500">
            Completed and closed jobs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <JobsInbox
          jobs={jobs || []}
          blockerLinks={blockerLinks || []}
          jobTypeLinks={jobTypeLinks || []}
        />
      </div>
    </main>
  )
}