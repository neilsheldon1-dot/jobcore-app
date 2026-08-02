import Link from 'next/link'
import { redirect } from 'next/navigation'
import AppHeader from '../../components/AppHeader'
import { createClient } from '../utils/supabase/server'
import { supabaseAdmin } from '../../lib/supabaseAdmin'

export const dynamic = 'force-dynamic'

export default async function MyJobsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('id, display_name, full_name, email')
    .eq('id', user.id)
    .maybeSingle()

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs_view')
    .select('*')
    .eq('assigned_user_id', user.id)
    .neq('status', 'Complete')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to load assigned jobs:', error)
  }

  const hour = new Date().getHours()

  const greeting =
    hour < 12
      ? 'Good morning'
      : hour < 17
        ? 'Good afternoon'
        : 'Good evening'

  const name =
    profile?.display_name ||
    profile?.full_name ||
    profile?.email ||
    'there'

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="my-jobs" />

      <div className="max-w-md mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {greeting}, {name}
          </h1>

          <p className="text-slate-500">
            {jobs?.length || 0}{' '}
            {jobs?.length === 1 ? 'job' : 'jobs'} assigned
          </p>
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job: any) => (
              <Link
                key={job.job_id}
                href={`/my-jobs/${job.job_id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-300 hover:shadow-md"
              >
                <p className="font-bold text-slate-900">
                  {[
                    job.address_line_1,
                    job.town,
                    job.postcode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  {job.description || 'No work description added'}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                    {job.job_type || 'Job'}
                  </span>

                  <span className="text-sm font-bold text-orange-600">
                    Open →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              No jobs assigned.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}