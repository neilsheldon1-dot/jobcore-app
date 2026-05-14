import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export const dynamic = 'force-dynamic'

type SearchParams = Promise<{
  status?: string
  type?: string
  urgent?: string
  search?: string
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
  const { data: jobs } = await query

  function getStatusColour(status: string) {
    switch (status) {
      case 'Ticket':
        return 'bg-pink-500'

      case 'Needs Quoting':
        return 'bg-purple-500'

      case 'Awaiting Approval':
        return 'bg-orange-500'

      case 'Awaiting Scaffolding':
        return 'bg-red-700'

      case 'Ready':
        return 'bg-emerald-600'

      case 'Scaffold Ready':
        return 'bg-green-900'

      case 'Needs Invoicing':
        return 'bg-blue-900'

      case 'Awaiting Asbestos Removal':
        return 'bg-sky-500'
  
      case 'Awaiting Gas Engineer':
        return 'bg-yellow-700'

       case 'Awaiting Solar Contractor':
        return 'bg-yellow-300'       

       case 'Awaiting TV Contractor':
        return 'bg-zinc-600'               

       case 'Awaiting Materials':
        return 'bg-purple-500'             
 
       case 'Access Issue':
        return 'bg-teal-400'     

        default:
        return 'bg-gray-500'
    }
  }

  function getStatusLetter(status: string) {
  switch (status) {
    case 'Ticket':
      return 'T'

    case 'Needs Quoting':
      return 'Q'

    case 'Awaiting Approval':
      return 'AA'

    case 'Awaiting Scaffolding':
      return 'AS'

    case 'Ready':
      return 'R'

    case 'Scaffold Ready':
      return 'SR'

    case 'Needs Invoicing':
      return 'I'

    case 'Awaiting Asbestos Removal':
      return 'AZZ'

    case 'Awaiting Gas Engineer':
      return 'G'

    case 'Awaiting Solar Contractor':
      return 'SC'

    case 'Awaiting TV Contractor':
      return 'TV'

    case 'Awaiting Materials':
      return 'M'

    case 'Access Issue':
      return '!'

    default:
      return '?'
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
    <main className="min-h-screen bg-blue-100">

      {/* Header */}
      <div className="sticky top-0 bg-blue-100 border-b z-20 p-3 md:p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">

<div>

<form action="/jobs" className="w-full">
  <input
    type="text"
    name="search"
    placeholder="Search address, postcode, client, description..."
    defaultValue={params.search || ''}
    className="w-full border border-blue-100 rounded-2xl px-5 py-3 bg-blue-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
  />
</form>

          </div>

          {params.status && (
            <div className="mt-4">
              <h1 className="text-2xl font-bold">
                {params.status}
              </h1>
            </div>
          )}

        </div>
      </div>

      {/* Inbox */}
      <div className="max-w-7xl mx-auto">

        {jobs?.map((job) => (
          <Link
            key={job.job_id}
            href={`/jobs/${job.job_id}`}
            className="block border-b-0 md:border-b md:border-gray-200 bg-white hover:bg-gray-100 transition"
          >
            <div className="p-3 md:p-4 flex items-start gap-4">

              {/* Status Circle */}
              <div
  className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${getStatusColour(job.status)}`}
>
  {getStatusLetter(job.status)}
</div>
            

              {/* Main Content */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between gap-4">

                  <h2 className="font-bold text-base md:text-lg truncate">
                    {job.address_line_1}
                  </h2>
                  <p className="text-sm text-gray-700 font-bold">
  {job.client}
</p>

                </div>

                <p className="text-gray-600 line-clamp-2 mt-0.5">
                  {job.description || 'No work description added'}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">

 <span
  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getJobTypeStyle(job.job_type)}`}
>
  {job.job_type}
</span>

                  {job.urgent && (
                    <span className="bg-red-500 text-white px-2.5 py-0.5 rounded-full text-xs font-bold">
                      URGENT
                    </span>
                  )}

                </div>

              </div>

            </div>
          </Link>
        ))}

      </div>
      <Link
  href="/"
  className="fixed bottom-6 left-6 z-50 bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
>
  ← Dashboard
</Link>

      <Link
  href="/jobs/new"
  className="fixed bottom-6 right-6 z-50 bg-blue-500 text-white px-6 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
>
  + Add New Job
</Link>
    </main>
  )
}