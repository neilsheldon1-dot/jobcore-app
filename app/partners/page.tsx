import Link from 'next/link'
import { supabaseAdmin } from '../../lib/supabaseAdmin'
import AppHeader from '../../components/AppHeader'

export const dynamic = 'force-dynamic'

export default async function PartnersPage() {
  const { count, error } = await supabaseAdmin
  .from('jobs_view')
  .select('*', {
    count: 'exact',
    head: true,
  })
  .eq(
    'assigned_user_id',
    'e1e6d845-f883-4472-afe1-2a1dcf2e5b86'
  )
  .neq('status', 'Complete')

if (error) {
  console.error(
    'Failed to count UPVC Outlet jobs:',
    error
  )
}

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="partners" />

      <div className="mx-auto max-w-7xl px-6 py-8">

        <h1 className="text-2xl font-bold text-slate-900">
          Partners
        </h1>

        <p className="mt-1 text-slate-500">
          Work assigned to partner organisations.
        </p>

        <div className="mt-8 max-w-md">

          <Link
            href="/jobs?status=Allocated&operative=e1e6d845-f883-4472-afe1-2a1dcf2e5b86"
            className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-orange-400 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  UPVC Outlet
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {count ?? 0} live {count === 1 ? 'job' : 'jobs'}
                </p>
              </div>

              <span className="font-bold text-orange-600">
                Open →
              </span>
            </div>
          </Link>

        </div>
      </div>
    </main>
  )
}