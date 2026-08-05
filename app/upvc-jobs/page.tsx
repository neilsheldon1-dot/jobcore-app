import Link from 'next/link'
import { Fragment } from 'react'
import { redirect } from 'next/navigation'
import UpvcHeader from '../../components/UpvcHeader'
import { createClient } from '../utils/supabase/server'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import AutoRefresh from '../../components/AutoRefresh'

export const dynamic = 'force-dynamic'

type ZoneOrder = {
  areaName: string
  areaOrder: number
  locationOrder: number
}

export default async function UpvcJobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs_view')
    .select('*')
    .eq('assigned_user_id', user.id)
    .neq('status', 'Complete')

  if (error) {
    console.error(
      'Failed to load UPVC Outlet jobs:',
      error
    )
  }

  const { data: zoneLocations, error: zoneError } =
    await supabaseAdmin
      .from('zone_locations')
      .select(`
        location_name,
        sort_order,
        area_zones (
          name,
          sort_order
        )
      `)

  if (zoneError) {
    console.error(
      'Failed to load UPVC job zones:',
      zoneError
    )
  }

  const locationOrder = new Map<string, ZoneOrder>(
    (zoneLocations || []).map((location: any) => [
      location.location_name,
      {
        areaName:
          location.area_zones?.name || 'Other',
        areaOrder:
          location.area_zones?.sort_order ?? 999,
        locationOrder:
          location.sort_order ?? 999,
      },
    ])
  )

  function getZoneOrder(
    zone: string | null
  ): ZoneOrder {
    if (!zone) {
      return {
        areaName: 'Other',
        areaOrder: 999,
        locationOrder: 999,
      }
    }

    return (
      locationOrder.get(zone) || {
        areaName: 'Other',
        areaOrder: 999,
        locationOrder: 999,
      }
    )
  }

  const sortedJobs = [...(jobs || [])].sort(
    (a: any, b: any) => {
      const aZone = getZoneOrder(a.zone)
      const bZone = getZoneOrder(b.zone)

      return (
        aZone.areaOrder - bZone.areaOrder ||
        aZone.locationOrder -
          bZone.locationOrder ||
        (a.postcode || '').localeCompare(
          b.postcode || ''
        ) ||
        (a.address_line_1 || '').localeCompare(
          b.address_line_1 || ''
        )
      )
    }
  )

  const areaCounts = sortedJobs.reduce(
    (
      counts: Record<string, number>,
      job: any
    ) => {
      const areaName =
        getZoneOrder(job.zone).areaName

      counts[areaName] =
        (counts[areaName] || 0) + 1

      return counts
    },
    {}
  )

  return (
    <main className="min-h-screen bg-slate-100">
      <AutoRefresh intervalMs={5000} />

      <UpvcHeader />

      <div className="mx-auto max-w-md p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">
            Jobs
          </h1>

          <p className="mt-1 text-slate-500">
            {sortedJobs.length}{' '}
            {sortedJobs.length === 1
              ? 'job'
              : 'jobs'}{' '}
            assigned
          </p>
        </div>

        {sortedJobs.length > 0 ? (
          <div className="space-y-3">
            {sortedJobs.map(
              (job: any, index: number) => {
                const areaName =
                  getZoneOrder(job.zone).areaName

                const previousAreaName =
                  index > 0
                    ? getZoneOrder(
                        sortedJobs[index - 1].zone
                      ).areaName
                    : null

                const showAreaHeading =
                  index === 0 ||
                  areaName !== previousAreaName

                return (
                  <Fragment key={job.job_id}>
                    {showAreaHeading && (
                      <div className="px-1 pt-2">
                        <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                            {areaName}
                          </p>

                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                            {areaCounts[areaName] || 0}
                          </span>
                        </div>
                      </div>
                    )}

                    <Link
  href={`/upvc-jobs/${job.job_id}`}
  className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-400 hover:shadow-md"
>
  <p className="font-bold text-slate-900">
    {[
      job.address_line_1,
      job.address_line_2,
      job.town,
      job.postcode,
    ]
      .map((part) =>
        typeof part === 'string'
          ? part
              .trim()
              .replace(/^,+|,+$/g, '')
              .trim()
          : part
      )
      .filter(Boolean)
      .join(', ')}
  </p>

  <p className="mt-2 text-sm leading-6 text-slate-600">
    {job.description || 'No work description added'}
  </p>

  <div className="mt-4 flex items-center justify-between gap-3">
    <div className="flex flex-wrap gap-2">
      {job.zone && (
        <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
          {job.zone.replace(/^\d+\s*-\s*/, '')}
        </span>
      )}

      <span className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-bold text-slate-600">
        {job.job_type || 'Job'}
      </span>
    </div>

    <span className="shrink-0 text-sm font-bold text-orange-600">
      Open →
    </span>
  </div>
</Link>
                  </Fragment>
                )
              }
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-center shadow-sm">
            <p className="font-bold text-white">
              No jobs assigned
            </p>

            <p className="mt-1 text-sm text-slate-300">
              New work will appear here when it is assigned.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}