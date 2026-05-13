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
    jobs?.filter((job) => job.status === 'Awaiting Approval').length ?? 0,

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

  awaiting_asbestos:
    jobs?.filter((job) => job.status === 'Awaiting Asbestos Removal').length ?? 0,

  awaiting_gas:
    jobs?.filter((job) => job.status === 'Awaiting Gas Engineer').length ?? 0,

  awaiting_solar:
    jobs?.filter((job) => job.status === 'Awaiting Solar Contractor').length ?? 0,

  awaiting_tv:
    jobs?.filter((job) => job.status === 'Awaiting TV Contractor').length ?? 0,

  awaiting_materials:
    jobs?.filter((job) => job.status === 'Awaiting Materials').length ?? 0,

  access_issue:
    jobs?.filter((job) => job.status === 'Access Issue').length ?? 0,
}
console.log('JOBS:', jobs)

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-8 text-black">
        Rubber Roofs Dashboard
      </h1>

       {/* Total Jobs */}
<div className="bg-gray-100 border border-black rounded-3xl shadow-lg p-6 mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    <u>Total Jobs</u>
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
    {/* Total Jobs */}
    <Link href="/jobs">
  <div className="bg-zinc-800 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
    <h2 className="text-orange-400 text-sm uppercase font-bold tracking-wide">
      Total Live Jobs
    </h2>
    <p className="text-2xl md:text-3xl font-bold text-orange-400">
      {stats.total_jobs}
    </p>
  </div>
</Link>

  </div>
</div>

      {/* Needs Attention */}
<div className="bg-gray-100 border border-black rounded-3xl shadow-lg p-6 mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    <u>Jobs Awaiting Action...</u>
  </h2>

<div className="flex flex-wrap gap-4 justify-start">

  {/* Urgent Jobs */}
<Link href="/jobs?urgent=true">
  <div className="bg-red-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
    <h2 className="text-white text-sm uppercase font-bold tracking-wide">
      Jobs Marked Urgent
    </h2>
    <p className="text-2xl md:text-3xl font-bold text-white">
      {stats.urgent_jobs}
    </p>
  </div>
</Link>

   {/* Needs Invoicing */}
    <Link href="/jobs?status=Needs%20Invoicing">
    <div className="bg-blue-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Invoicing
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.needs_invoicing}
      </p>
    </div>
    </Link>
  
    {/* Needs Quote */}
    <Link href="/jobs?status=Needs%20Quoting">
    <div className="bg-purple-300 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Quoting
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.needs_quote}
      </p>
    </div>
    </Link>

     {/* Quoted / Awaiting Approval */}
    <Link href="/jobs?status=Awaiting%20Approval">
    <div className="bg-orange-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Awaiting Approval
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_approval}
      </p>
    </div>
    </Link>

    {/* Awaiting Scaffold */}
    <Link href="/jobs?status=Awaiting%20Scaffolding">
    <div className="bg-red-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Scaffolding
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_scaffolding}
      </p>
    </div>
    </Link>

    {/* Awaiting Asbestos */}
    <Link href="/jobs?status=Awaiting%20Asbestos%20Removal">
    <div className="bg-sky-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Asbestos Removal
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_asbestos}
      </p>
    </div>
    </Link>

    {/* Awaiting Gas */}
    <Link href="/jobs?status=Awaiting%20Gas%20Engineer">
    <div className="bg-yellow-700 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Gas Engineer
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_gas}
      </p>
    </div>
    </Link>

    {/* Awaiting Solar */}
    <Link href="/jobs?status=Awaiting%20Solar%20Contractor">
    <div className="bg-yellow-300 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-black text-sm uppercase font-bold tracking-wide">
        Solar Contractor
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-black">
        {stats.awaiting_solar}
      </p>
    </div>
    </Link>

    {/* Awaiting TV */}
    <Link href="/jobs?status=Awaiting%20TV%20Contractor">
    <div className="bg-zinc-600 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        TV Contractor
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_tv}
      </p>
    </div>
    </Link>

    {/* Awaiting Materials */}
    <Link href="/jobs?status=Awaiting%20Materials">
    <div className="bg-purple-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Material
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.awaiting_materials}
      </p>
    </div>
    </Link>

    {/* Access Issue */}
    <Link href="/jobs?status=Access%20Issue">
    <div className="bg-teal-400 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Access Issue
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.access_issue}
      </p>
    </div>
    </Link>

  </div>
</div>

{/* Current Work Status */}
<div className="bg-gray-100 border border-black rounded-3xl shadow-lg p-6 mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    <u>Current Work Status</u>
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
    {/* Tickets */}
   <Link href="/jobs?status=Ticket">
    <div className="bg-pink-500 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Tickets
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.tickets}
      </p>
    </div>
    </Link>

    {/* Ready Jobs */}
    <Link href="/jobs?status=Ready">
    <div className="bg-emerald-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-emerald-800 text-sm uppercase font-bold tracking-wide">
        Ready - No Scaffolding
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-emerald-800">
        {stats.ready_jobs}
      </p>
    </div>
    </Link>

    {/* Scaffold Ready */}
    <Link href="/jobs?status=Scaffold%20Ready">
    <div className="bg-emerald-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        READY - Scaffolding Up
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.scaffolding}
      </p>
    </div>
    </Link>


  </div>
</div>

{/* Job Types */}
<div className="bg-gray-100 border border-black rounded-3xl shadow-lg p-6 mb-10">
  <h2 className="text-2xl font-bold text-black mb-4">
    <u>Job Types</u>
  </h2>

  <div className="flex flex-wrap gap-4 justify-start">
  {/* Reactive */}
  <Link href="/jobs?type=Reactive">
    <div className="bg-lime-300 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-teal-800 text-sm uppercase font-bold tracking-wide">
        Reactive
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-teal-800">
        {stats.reactive}
      </p>
    </div>
    </Link>
    
    {/* Re Roof */}
    <Link href="/jobs?type=Re%20Roof">
    <div className="bg-amber-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-indigo-900 text-sm uppercase font-bold tracking-wide">
        Re Roof
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-indigo-900">
        {stats.re_roof}
      </p>
    </div>
    </Link>

    {/* Sika Roof */}
    <Link href="/jobs?type=Sika%20Roof">
    <div className="bg-cyan-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-cyan-100 text-sm uppercase font-bold tracking-wide">
        Sika Roof
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-cyan-100">
        {stats.sika_roof}
      </p>
    </div>
    </Link>

    {/* Hydro */}
    <Link href="/jobs?type=Hydro">
    <div className="bg-blue-200 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-cyan-900 text-sm uppercase font-bold tracking-wide">
        Hydro
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-cyan-900">
        {stats.hydro}
      </p>
    </div>
    </Link>

    {/* Roofline */}
    <Link href="/jobs?type=Roofline%20%2F%20EPS">
    <div className="bg-orange-400 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Roofline / EPS
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.roofline}
      </p>
    </div>
    </Link>

    {/* Flat Roof */}
    <Link href="/jobs?type=Flat%20Roof">
    <div className="bg-sky-400 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-white text-sm uppercase font-bold tracking-wide">
        Flat Roof
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-white">
        {stats.flat_roof}
      </p>
    </div>
    </Link>

    {/* Scheme */}
    <Link href="/jobs?type=Scheme">
    <div className="bg-amber-900 border-4 border-white rounded-3xl shadow-lg p-6 w-[260px] h-28 hover:scale-105 active:scale-95 transition cursor-pointer">
      <h2 className="text-amber-200 text-sm uppercase font-bold tracking-wide">
        Scheme
      </h2>
      <p className="text-2xl md:text-3xl font-bold text-amber-200">
        {stats.scheme}
      </p>
    </div>
    </Link>
  </div>
</div>


    </main>
  )
}