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

  const { data: zoneLocations } = await supabase
    .from('zone_locations')
    .select(`
      location_name,
      sort_order,
      area_zones (
        sort_order
      )
    `)

  const locationOrder = new Map(
    (zoneLocations || []).map((location: any) => [
      location.location_name,
      {
        areaOrder: location.area_zones?.sort_order ?? 999,
        locationOrder: location.sort_order ?? 999,
      },
    ])
  )

  function getZonePrintColour(zone: string) {
    const zoneInfo = locationOrder.get(zone)
    const areaOrder = zoneInfo?.areaOrder ?? 999

    switch (areaOrder) {
      case 1:
        return 'bg-blue-50'
      case 2:
        return 'bg-green-50'
      case 3:
        return 'bg-amber-50'
      case 4:
        return 'bg-purple-50'
      case 5:
        return 'bg-cyan-50'
      case 6:
        return 'bg-rose-50'
      case 7:
        return 'bg-slate-50'
      default:
        return 'bg-white'
    }
  }

  const sortedJobs = [...(jobs || [])].sort((a: any, b: any) => {
    const aZone = locationOrder.get(a.zone) || {
      areaOrder: 999,
      locationOrder: 999,
    }

    const bZone = locationOrder.get(b.zone) || {
      areaOrder: 999,
      locationOrder: 999,
    }

    return (
      aZone.areaOrder - bZone.areaOrder ||
      aZone.locationOrder - bZone.locationOrder ||
      (a.town || '').localeCompare(b.town || '') ||
      (a.address_line_1 || '').localeCompare(b.address_line_1 || '')
    )
  })

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
        {sortedJobs && sortedJobs.length > 0 ? (
          sortedJobs.map((job) => {
            const jobNotes =
              notes?.filter((note) => note.job_id === job.job_id) || []

            return (
              <div
                key={job.job_id}
                className={`border border-slate-300 rounded-lg p-3 text-sm break-inside-avoid ${getZonePrintColour(job.zone)}`}
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

                <div className="border border-slate-200 rounded-lg p-3 bg-white/60">
                  <p className="text-xs uppercase font-bold text-slate-500 mb-2">
                    Work Description
                  </p>

                  <p className="whitespace-pre-wrap text-slate-800 leading-snug">
                    {job.description || 'No description added'}
                  </p>
                </div>

                {jobNotes.length > 0 && (
                  <div className="border border-slate-200 rounded-lg p-3 mt-3 bg-white/60">
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