import AppHeader from '../../components/AppHeader'
import { supabase } from '../../lib/supabase'
import JobsInbox from './JobsInbox'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  status?: string
  type?: string
  urgent?: string
  search?: string
  blocker?: string
  ready?: string
  blocked?: string
}>

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  let query = supabase
    .from('jobs_view')
    .select('*')
    .neq('status', 'Complete')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status)
  }

  if (params.urgent === 'true') {
    query = query.eq('urgent', true)
  }

  if (params.search) {
    query = query.or(
      `address_line_1.ilike.%${params.search}%,postcode.ilike.%${params.search}%,client.ilike.%${params.search}%,description.ilike.%${params.search}%,job_number.ilike.%${params.search}%,po_number.ilike.%${params.search}%`
    )
  }

  let { data: jobs } = await query

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

  if (params.type) {
    const matchingJobIds =
      jobTypeLinks
        ?.filter(
          (link: any) =>
            link.job_types?.name === params.type
        )
        .map((link: any) => link.job_id) || []

    jobs =
      jobs?.filter((job: any) =>
        matchingJobIds.includes(job.job_id)
      ) || []
  }

  if (params.blocker) {
    const selectedBlocker = params.blocker.toLowerCase()

    const blockedJobIds =
      blockerLinks
        ?.filter((link: any) => {
          const blockerName =
            link.blocker_types?.name?.toLowerCase()

          return blockerName === selectedBlocker
        })
        .map((link: any) => link.job_id) || []

    jobs =
      jobs?.filter((job: any) =>
        blockedJobIds.includes(job.job_id)
      ) || []
  }

  if (params.ready === 'true') {
    jobs =
      jobs?.filter((job: any) => {
        const hasBlockers =
          blockerLinks?.some(
            (link: any) => link.job_id === job.job_id
          ) ?? false

        return job.status === 'Ready' && !hasBlockers
      }) || []
  }

  if (params.blocked === 'true') {
    jobs =
      jobs?.filter((job: any) => {
        const hasBlockers =
          blockerLinks?.some(
            (link: any) => link.job_id === job.job_id
          ) ?? false

        return hasBlockers
      }) || []
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Live Jobs
          </h1>

          <p className="text-sm text-slate-500">
            Current operational inbox for active works
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {(params.status ||
          params.type ||
          params.blocked === 'true' ||
          params.ready === 'true' ||
          params.blocker) && (
          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
            <h2 className="text-lg font-bold text-slate-900">
              {params.status ||
                (params.type ? `Job Type: ${params.type}` : '') ||
                (params.blocker ? `Waiting On: ${params.blocker}` : '') ||
                (params.blocked === 'true' ? 'Waiting On' : '') ||
                (params.ready === 'true' ? 'Ready Jobs' : '')}
            </h2>
          </div>
        )}

        <JobsInbox
          jobs={jobs || []}
          blockerLinks={blockerLinks || []}
          jobTypeLinks={jobTypeLinks || []}
          enableSelection={params.status === 'Ticket'}
        />
      </div>
    </main>
  )
}