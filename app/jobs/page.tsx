import Link from 'next/link'
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
  .order('sort_order', { ascending: true })
.order('created_at', { ascending: false })

if (params.status) {
  query = query.eq('status', params.status)
}

if (params.type) {
  query = query.eq('job_type', params.type)
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
    
if (params.blocker) {
  

  const blockedJobIds =
    blockerLinks
      ?.filter(
        (link: any) =>
          link.blocker_types?.name === params.blocker
      )
      .map((link) => link.job_id) || []

  jobs =
    jobs?.filter((job) =>
      blockedJobIds.includes(job.job_id)
    ) || []
}
if (params.ready === 'true') {
  jobs =
    jobs?.filter((job) => {
      const hasBlockers =
        blockerLinks?.some(
          (link: any) => link.job_id === job.job_id
        ) ?? false

      return job.status === 'Ready' && !hasBlockers
    }) || []
}

if (params.blocked === 'true') {
  jobs =
    jobs?.filter((job) => {
      const hasBlockers =
        blockerLinks?.some(
          (link: any) => link.job_id === job.job_id
        ) ?? false

      return hasBlockers
    }) || []
}

  function getStatusColour(status: string) {
  switch (status) {
    case 'Ticket':
      return 'bg-pink-500'
    case 'Allocated':
      return 'bg-emerald-300'
    case 'Needs Quoting':
      return 'bg-purple-500'
    case 'Awaiting Approval':
      return 'bg-orange-500'
    case 'Planned':
      return 'bg-green-500'
    case 'Ready':
      return 'bg-emerald-600'
    case 'In Progress':
      return 'bg-cyan-600'
    case 'Needs Invoicing':
      return 'bg-indigo-700'
    case 'Complete':
      return 'bg-green-700'
    case 'Cancelled':
      return 'bg-slate-500'
    default:
      return 'bg-slate-400'
  }
}


  function getStatusLetter(status: string) {
  switch (status) {
    case 'Ticket':
      return 'T'

    case 'Allocated':
      return '✓A'

    case 'Needs Quoting':
      return '£Q'

    case 'Awaiting Approval':
      return '?'

    case 'Ready':
      return '✓R'

    case 'Needs Invoicing':
      return '£i'

    case 'Complete':
      return '✅'

    default:
      return 'x'
  }
}
function getJobTypeStyle(jobType: string) {
  switch (jobType) {
    case 'Reactive':
      return 'bg-lime-300 text-teal-800'

    case 'Planned':
      return 'bg-gray-700 text-white'

    case 'Sika Roof':
      return 'bg-cyan-900 text-cyan-100'

    case 'Roofline / EPS':
      return 'bg-orange-400 text-white'

    case 'Hydro':
      return 'bg-blue-200 text-cyan-900'

    case 'Re Roof':
      return 'bg-amber-200 text-indigo-900'

    case 'Scheme':
      return 'bg-amber-900 text-amber-200'

    case 'Flat Roof':
      return 'bg-sky-400 text-white'

    default:
      return 'bg-gray-200 text-gray-800'
  }
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

      {/* Header */}
 <div className="max-w-7xl mx-auto px-6 py-8">

  

  {(params.status || params.blocked === 'true' || params.ready === 'true' || params.blocker) && (
    <div className="mb-6 bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-4">
      <h2 className="text-lg font-bold text-slate-900">
        {params.status ||
          (params.blocked === 'true' ? 'Waiting On' : '') ||
          (params.ready === 'true' ? 'Ready Jobs' : '') ||
          (params.blocker ? `Waiting On: ${params.blocker}` : '')}
      </h2>
    </div>
  )}

  <JobsInbox
  jobs={jobs || []}
  blockerLinks={blockerLinks || []}
  enableSelection={params.status === 'Ticket'}
/>
    </div>
  </main>
)
}