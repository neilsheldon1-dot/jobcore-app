import Link from 'next/link'
import AppHeader from '../../../components/AppHeader'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

type ReviewJob = {
  job_id: string
  address_line_1?: string | null
  town?: string | null
  postcode?: string | null
  description?: string | null
  created_at?: string | null
}

export default async function JobsReviewPage() {
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs_view')
   .select(
  'job_id, address_line_1, town, postcode, description, created_at'
)
.eq('status', 'Needs Review')
.order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load review jobs:', error)
  }

  const reviewJobs = (jobs || []) as ReviewJob[]

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            Jobs Needing Review
          </h1>

          <p className="mt-2 text-slate-500">
            These jobs have been returned from site and require
            an office decision.
          </p>
        </div>

        {reviewJobs.length > 0 ? (
          <div className="space-y-4">
            {reviewJobs.map((job) => {
              const address = [
                job.address_line_1,
                job.town,
                job.postcode,
              ]
                .filter(Boolean)
                .join(', ')

              return (
                <Link
                  key={job.job_id}
                  href={`/jobs/${job.job_id}`}
                  className="block rounded-2xl border border-amber-200 bg-white p-5 shadow-sm transition hover:border-amber-400 hover:bg-amber-50"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-lg font-bold text-slate-900">
                        {address || 'Address not recorded'}
                      </p>

                      <p className="mt-2 text-sm text-slate-600">
                        {job.description ||
                          'No work description recorded'}
                      </p>

                      {job.created_at && (
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Returned{' '}
                          {new Date(
                            job.created_at
                          ).toLocaleString('en-GB')}
                        </p>
                      )}
                    </div>

                    <span className="shrink-0 text-sm font-bold text-amber-700">
                      Review →
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="font-semibold text-slate-700">
              No jobs are waiting for review.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}