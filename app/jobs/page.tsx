import Link from 'next/link'
import { supabase } from '../../lib/supabase'

type SearchParams = Promise<{
  status?: string
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

  return (
    <main className="min-h-screen bg-gray-100">

      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-20 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto">

          <div className="flex items-center gap-4">

            <Link
              href="/"
              className="bg-black text-white px-4 py-2 rounded-xl font-bold hover:scale-105 transition"
            >
              ← Dashboard
            </Link>

            <input
              type="text"
              placeholder="Search jobs..."
              className="flex-1 text-white border border-blue-100 rounded-2xl px-5 py-3 bg-blue-50"
              disabled
            />

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
            className="block border-b bg-white hover:bg-gray-50 transition"
          >
            <div className="p-4 flex items-start gap-4">

              {/* Status Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${getStatusColour(job.status)}`}
              >
                {getStatusLetter(job.status)}
              </div>

              {/* Main Content */}
              <div className="flex-1 min-w-0">

                <div className="flex items-center justify-between gap-4">

                  <h2 className="font-bold text-lg truncate">
                    {job.address_line_1}
                  </h2>

                </div>

                <p className="text-gray-600 line-clamp-2 mt-1">
                  {job.description || 'No work description added'}
                </p>

                <div className="flex flex-wrap gap-2 mt-3">

                  <span className="bg-gray-200 px-3 py-1 rounded-full text-sm font-medium">
                    {job.job_type}
                  </span>

                  {job.urgent && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      URGENT
                    </span>
                  )}

                </div>

              </div>

            </div>
          </Link>
        ))}

      </div>
    </main>
  )
}