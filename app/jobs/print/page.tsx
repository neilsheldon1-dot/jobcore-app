import { supabase } from '../../../lib/supabase'

type SearchParams = Promise<{
  ids?: string
}>

export default async function PrintJobsPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const params = await searchParams

  const ids = params.ids?.split(',').filter(Boolean) || []

  const { data: jobs } = await supabase
    .from('jobs_view')
    .select('*')
    .in('job_id', ids)

  const { data: notes } = await supabase
    .from('job_notes')
    .select('*')
    .in('job_id', ids)
    .order('created_at', { ascending: false })

  return (
    <main className="bg-white min-h-screen p-8">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h1 className="text-base font-bold">
          Print Jobs
        </h1>

        <p className="text-sm text-slate-500">
          Press Cmd+P or Ctrl+P to print
        </p>
      </div>

      <div className="grid gap-3">
        {jobs && jobs.length > 0 ? (
          jobs.map((job) => {
            const jobNotes =
              notes?.filter((note) => note.job_id === job.job_id) || []

            return (
              <div
                key={job.job_id}
                className="border border-slate-300 rounded-lg p-3 text-sm break-inside-avoid"
              >
                <div className="flex items-start justify-between gap-6 mb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {job.address_line_1}
                    </h2>

                    <p className="text-slate-600 mt-1">
                      {[job.address_line_2, job.town, job.postcode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>

                    {job.tenant_contact && (
                      <p className="text-xs text-slate-700 mt-1">
                        <span className="font-bold">Contact:</span>{' '}
                        {job.tenant_contact}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-500">
                      Job Number
                    </p>

                    <p className="font-bold text-base">
                      {job.job_number || 'N/A'}
                    </p>

                    {job.urgent && (
                      <p className="text-xs font-bold text-red-600 mt-1">
                        URGENT
                      </p>
                    )}
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3">
                  <p className="text-xs uppercase font-bold text-slate-500 mb-2">
                    Work Description
                  </p>

                  <p className="whitespace-pre-wrap text-slate-800 leading-snug">
                    {job.description || 'No description added'}
                  </p>
                </div>

                {jobNotes.length > 0 && (
                  <div className="border border-slate-200 rounded-lg p-3 mt-3">
                    <p className="text-xs uppercase font-bold text-slate-500 mb-2">
                      Updates / Notes
                    </p>

                    <div className="space-y-2">
                      {jobNotes.slice(0, 3).map((note) => (
                        <div key={note.id}>
                          <p className="text-xs text-slate-800 whitespace-pre-wrap">
                            {note.content}
                          </p>

                          <p className="text-[10px] text-slate-400">
                            {note.created_by || 'Unknown'} •{' '}
                            {new Date(note.created_at).toLocaleDateString(
                              'en-GB'
                            )}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-slate-500">
            No jobs found to print.
          </p>
        )}
      </div>
    </main>
  )
}