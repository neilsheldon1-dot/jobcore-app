import Image from 'next/image'
import AppHeader from '../components/AppHeader'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import DashboardSearch from './DashboardSearch'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: jobs } = await supabase
    .from('jobs_view')
    .select('*')
    .neq('status', 'Complete')
    .order('sort_order', { ascending: true })

  const { data: blockerLinks } = await supabase
    .from('job_blocker_links')
    .select(`
      *,
      blocker_types (
        name
      )
    `)

  const { data: jobTypes } = await supabase
    .from('job_types')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const { data: jobTypeLinks } = await supabase
    .from('job_type_links')
    .select(`
      *,
      job_types (
        name
      )
    `)

  function hasBlockers(jobId: string) {
    return blockerLinks?.some((link: any) => link.job_id === jobId) ?? false
  }

  function getBlockerCount(blockerName: string) {
    const liveJobIds = jobs?.map((job) => job.job_id) || []

    return (
      blockerLinks?.filter(
        (link: any) =>
          link.blocker_types?.name === blockerName &&
          liveJobIds.includes(link.job_id)
      ).length ?? 0
    )
  }

  function getJobTypeCount(typeName: string) {
    const liveJobIds = jobs?.map((job) => job.job_id) || []

    return (
      jobTypeLinks?.filter(
        (link: any) =>
          link.job_types?.name === typeName &&
          liveJobIds.includes(link.job_id)
      ).length ?? 0
    )
  }

  const dashboardBlockers = [
    { name: 'Scaffold', label: 'Scaffolding', accent: 'border-l-blue-900' },
    { name: 'Asbestos', label: 'Asbestos', accent: 'border-l-sky-500' },
    { name: 'Materials', label: 'Materials', accent: 'border-l-purple-500' },
    { name: 'Access', label: 'Access', accent: 'border-l-teal-500' },
    { name: 'Gas', label: 'Gas', accent: 'border-l-yellow-700' },
    { name: 'Solar', label: 'Solar', accent: 'border-l-yellow-300' },
    { name: 'Satellite', label: 'Satellite', accent: 'border-l-zinc-600' },
    
  ]
    .map((blocker) => ({
      ...blocker,
      count: getBlockerCount(blocker.name),
    }))
    .filter((blocker) => blocker.count > 0)

  const stats = {
    total_jobs: jobs?.length ?? 0,

    tickets:
      jobs?.filter((job) => job.status === 'Ticket').length ?? 0,

    ready_jobs:
      jobs?.filter(
        (job) => job.status === 'Ready' && !hasBlockers(job.job_id)
      ).length ?? 0,

    blocked_jobs:
      jobs?.filter((job) => hasBlockers(job.job_id)).length ?? 0,

    denbighshire:
      jobs?.filter((job) => job.client === 'Denbighshire').length ?? 0,

    cartrefi:
      jobs?.filter((job) => job.client === 'Cartrefi').length ?? 0,

    creating_enterprise:
      jobs?.filter((job) => job.client === 'Creating Enterprise').length ?? 0,

    private_jobs:
      jobs?.filter((job) => job.client === 'Private').length ?? 0,

    urgent_jobs:
      jobs?.filter((job) => job.urgent === true).length ?? 0,

    needs_quote:
      jobs?.filter((job) => job.status === 'Needs Quoting').length ?? 0,

    awaiting_approval:
      jobs?.filter((job) => job.status === 'Awaiting Approval').length ?? 0,

    needs_invoicing:
      jobs?.filter((job) => job.status === 'Needs Invoicing').length ?? 0,
  }

  function WidgetRow({
    href,
    label,
    value,
    accent = 'border-l-blue-500',
  }: {
    href: string
    label: string
    value: number
    accent?: string
  }) {
    return (
      <Link
        href={href}
        className={`flex items-center justify-between border-l-4 ${accent} px-4 py-3 hover:bg-gray-50 transition`}
      >
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-slate-900 min-w-8">
            {value}
          </span>

          <span className="text-sm text-slate-700">
            {label}
          </span>
        </div>

        <span className="text-blue-600 font-bold">
          →
        </span>
      </Link>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="home" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 text-blue-700 rounded-lg w-12 h-12 flex items-center justify-center font-bold shrink-0">
              RR
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Rubber Roofs Operations
              </h1>

              <p className="text-sm text-slate-500">
                Powered by JobCore
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-6">
        <DashboardSearch jobs={jobs || []} />
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-1 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Current Work Status
              </h3>
            </div>

            <div className="divide-y">
              <WidgetRow href="/jobs" label="Total Live Jobs" value={stats.total_jobs} accent="border-l-slate-700" />
              <WidgetRow href="/jobs?status=Ticket" label="Tickets" value={stats.tickets} accent="border-l-pink-500" />
              <WidgetRow href="/jobs?ready=true" label="Ready Jobs" value={stats.ready_jobs} accent="border-l-green-500" />
              <WidgetRow href="/jobs?blocked=true" label="Blocked Jobs" value={stats.blocked_jobs} accent="border-l-red-600" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Jobs Awaiting Action
              </h3>
            </div>

            <div className="divide-y">
              <WidgetRow href="/jobs?urgent=true" label="Jobs Marked Urgent" value={stats.urgent_jobs} accent="border-l-red-500" />
              <WidgetRow href="/jobs?status=Needs%20Quoting" label="Needs Quoting" value={stats.needs_quote} accent="border-l-purple-500" />
              <WidgetRow href="/jobs?status=Awaiting%20Approval" label="Awaiting Approval" value={stats.awaiting_approval} accent="border-l-orange-500" />
              <WidgetRow href="/jobs?status=Needs%20Invoicing" label="Needs Invoicing" value={stats.needs_invoicing} accent="border-l-blue-900" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Blockers / Dependencies
              </h3>
            </div>

            <div className="divide-y">
              {dashboardBlockers.length > 0 ? (
                dashboardBlockers.map((blocker) => (
                  <WidgetRow
                    key={blocker.name}
                    href={`/jobs?blocker=${encodeURIComponent(blocker.name)}`}
                    label={blocker.label}
                    value={blocker.count}
                    accent={blocker.accent}
                  />
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400">
                  No active blockers
                </div>
              )}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg text-center font-bold text-slate-900">
                Job Types
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
              <div className="divide-y">
                {jobTypes
                  ?.slice(0, Math.ceil((jobTypes?.length || 0) / 2))
                  .map((jobType) => (
                    <WidgetRow
                      key={jobType.id}
                      href={`/jobs?type=${encodeURIComponent(jobType.name)}`}
                      label={jobType.name}
                      value={getJobTypeCount(jobType.name)}
                      accent="border-l-slate-400"
                    />
                  ))}
              </div>

              <div className="divide-y">
                {jobTypes
                  ?.slice(Math.ceil((jobTypes?.length || 0) / 2))
                  .map((jobType) => (
                    <WidgetRow
                      key={jobType.id}
                      href={`/jobs?type=${encodeURIComponent(jobType.name)}`}
                      label={jobType.name}
                      value={getJobTypeCount(jobType.name)}
                      accent="border-l-slate-400"
                    />
                  ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Client Workload
              </h3>
            </div>

            <div className="divide-y">
              <WidgetRow href="/jobs?client=Denbighshire" label="Denbighshire" value={stats.denbighshire} accent="border-l-blue-600" />
              <WidgetRow href="/jobs?client=Cartrefi" label="Cartrefi" value={stats.cartrefi} accent="border-l-emerald-600" />
              <WidgetRow href="/jobs?client=Creating%20Enterprise" label="Creating Enterprise" value={stats.creating_enterprise} accent="border-l-orange-500" />
              <WidgetRow href="/jobs?client=Private" label="Private" value={stats.private_jobs} accent="border-l-slate-600" />
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-bold text-slate-900">
                Quick Actions
              </h3>
            </div>

            <div className="p-6 grid gap-3">
              <Link
                href="/jobs/new"
                className="bg-blue-600 text-white text-center px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition"
              >
                + Add New Job
              </Link>

              <Link
                href="/jobs"
                className="border border-gray-300 text-slate-700 text-center px-5 py-3 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                View All Jobs
              </Link>
            </div>
          </section>

        </div>
      </div>
    </main>
  )
}