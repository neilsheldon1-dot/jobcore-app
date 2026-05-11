import Link from 'next/link'

import { supabase } from '../lib/supabase'

export default async function Home() {
  const { data: jobs } = await supabase
  .from('jobs_view')
  .select('*')
  .order('sort_order', { ascending: true })

  const stats = {
  total_jobs: jobs?.length ?? 0,

  tickets:
    jobs?.filter((job) => job.status === 'Ticket').length ?? 0,

  needs_quote:
    jobs?.filter((job) => job.status === 'Needs Quoting').length ?? 0,

  awaiting_approval:
    jobs?.filter((job) => job.status === 'Quoted Awaiting Approval').length ?? 0,

  awaiting_scaffolding:
    jobs?.filter((job) => job.status === 'Awaiting Scaffolding').length ?? 0,

  ready_jobs:
    jobs?.filter((job) => job.status === 'Ready').length ?? 0,

  needs_invoicing:
    jobs?.filter((job) => job.status === 'Needs Invoicing').length ?? 0,

  urgent_jobs:
    jobs?.filter((job) => job.urgent === true).length ?? 0,

  re_roof:
    jobs?.filter((job) => job.job_type === 'Re Roof').length ?? 0,

  roofline:
    jobs?.filter((job) => job.job_type === 'Roofline / EPS').length ?? 0,

  sika_roof:
    jobs?.filter((job) => job.job_type === 'Sika Roof').length ?? 0,

  hydro:
    jobs?.filter((job) => job.job_type === 'Hydro').length ?? 0,

  scheme:
    jobs?.filter((job) => job.job_type === 'Scheme').length ?? 0,

  reactive:
    jobs?.filter((job) => job.job_type === 'Reactive').length ?? 0,

  flat_roof:
    jobs?.filter((job) => job.job_type === 'Flat Roof').length ?? 0,

  scaffolding:
    jobs?.filter((job) => job.status === 'Scaffold Ready').length ?? 0,
}
console.log('JOBS:', jobs)

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8 text-black">
        Rubber Roofs Dashboard
      </h1>

       {/* Total Jobs */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-orange-500 mb-4">
    Total Jobs
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
    {/* Total Jobs */}
    <div className="bg-zinc-800 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-orange-400 text-sm uppercase font-bold tracking-wide">
        Total Jobs
      </h2>
      <p className="text-4xl font-bold text-orange-400">
        {stats.total_jobs}
      </p>
    </div>
  </div>
</section>

      {/* Needs Attention */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-red-500 mb-4">
    Needs Attention
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
    {/* Needs Quote */}
    <div className="bg-purple-300 border-4 border-red-500 rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-purple-800 text-sm uppercase font-bold tracking-wide">
        Need To Quote
      </h2>
      <p className="text-4xl font-bold text-purple-800">
        {stats.needs_quote}
      </p>
    </div>

    {/* Needs Invoicing */}
    <div className="bg-blue-900 border-4 border-red-500 rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-blue-200 text-sm uppercase font-bold tracking-wide">
        Needs Invoicing
      </h2>
      <p className="text-4xl font-bold text-blue-200">
        {stats.needs_invoicing}
      </p>
    </div>

    {/* Urgent Jobs */}
    <div className="bg-red-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Jobs Marked Urgent
      </h2>
      <p className="text-4xl font-bold text-white">
        {stats.urgent_jobs}
      </p>
    </div>

    {/* Quoted / Awaiting Approval */}
    <div className="bg-orange-300 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-orange-800 text-sm uppercase font-bold tracking-wide">
        Quoted / Awaiting Approval
      </h2>
      <p className="text-4xl font-bold text-orange-800">
        {stats.awaiting_approval}
      </p>
    </div>

    {/* Awaiting Scaffold */}
    <div className="bg-red-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-red-300 text-sm uppercase font-bold tracking-wide">
        Paused Awaiting Scaffold
      </h2>
      <p className="text-4xl font-bold text-red-300">
        {stats.awaiting_scaffolding}
      </p>
    </div>
  </div>
</section>

{/* Current Work Status */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    Current Work Status
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
    {/* Tickets */}
    <div className="bg-pink-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-pink-200 text-sm uppercase font-bold tracking-wide">
        Tickets
      </h2>
      <p className="text-4xl font-bold text-pink-200">
        {stats.tickets}
      </p>
    </div>

    {/* Ready Jobs */}
    <div className="bg-emerald-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-emerald-800 text-sm uppercase font-bold tracking-wide">
        Ready - No Scaffolding
      </h2>
      <p className="text-4xl font-bold text-emerald-800">
        {stats.ready_jobs}
      </p>
    </div>

    {/* Scaffold Ready */}
    <div className="bg-emerald-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-green-200 text-sm uppercase font-bold tracking-wide">
        READY - Scaffolding Up
      </h2>
      <p className="text-4xl font-bold text-green-200">
        {stats.scaffolding}
      </p>
    </div>


  </div>
</section>

{/* Job Types */}
<section className="mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    Job Types
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
  {/* Reactive */}
    <div className="bg-lime-300 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-teal-800 text-sm uppercase font-bold tracking-wide">
        Reactive
      </h2>
      <p className="text-4xl font-bold text-teal-800">
        {stats.reactive}
      </p>
    </div>
    
    {/* Re Roof */}
    <div className="bg-amber-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-indigo-900 text-sm uppercase font-bold tracking-wide">
        Re Roof
      </h2>
      <p className="text-4xl font-bold text-indigo-900">
        {stats.re_roof}
      </p>
    </div>

    {/* Sika Roof */}
    <div className="bg-cyan-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-cyan-100 text-sm uppercase font-bold tracking-wide">
        Sika Roof
      </h2>
      <p className="text-4xl font-bold text-cyan-100">
        {stats.sika_roof}
      </p>
    </div>

    {/* Hydro */}
    <div className="bg-blue-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-cyan-900 text-sm uppercase font-bold tracking-wide">
        Hydro
      </h2>
      <p className="text-4xl font-bold text-cyan-900">
        {stats.hydro}
      </p>
    </div>

    {/* Roofline */}
    <div className="bg-orange-400 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Roofline / EPS
      </h2>
      <p className="text-4xl font-bold text-white">
        {stats.roofline}
      </p>
    </div>

    {/* Flat Roof */}
    <div className="bg-sky-400 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Flat Roof
      </h2>
      <p className="text-4xl font-bold text-white">
        {stats.flat_roof}
      </p>
    </div>

    {/* Scheme */}
    <div className="bg-amber-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-32">
      <h2 className="text-amber-200 text-sm uppercase font-bold tracking-wide">
        Scheme
      </h2>
      <p className="text-4xl font-bold text-amber-200">
        {stats.scheme}
      </p>
    </div>
  </div>
</section>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Live Jobs</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b text-left">
              <th className="p-2">Job Number</th>
              <th className="p-2">PO Number</th>
              <th className="p-2">Address</th>
              <th className="p-2">Area</th>
              <th className="p-2">Status</th>
              <th className="p-2">Job Type</th>
              <th className="p-2">Tenant Contact</th>
            </tr>
          </thead>

          <tbody>
            {jobs?.map((job) => (
              <tr
  key={job.job_id}
  className="border-b hover:bg-gray-100 cursor-pointer"
>
                <td className="p-2">
  <Link href={`/jobs/${job.job_id}`}>
    {job.job_number || 'Open Job'}
  </Link>
</td>
                <td className="p-2">{job.po_number}</td>
                <td className="p-2">{job.address_line_1}</td>
                <td className="p-2">{job.town}</td>
                <td className="p-2">{job.status}</td>
                <td className="p-2">{job.job_type}</td>
                <td className="p-2">{job.tenant_contact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}