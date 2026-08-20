import Link from 'next/link'
import JobSummaryCard from '@/components/JobSummaryCard'
import CompletionPackBuilder from './DocumentComposer'
import { supabase } from '../../../../../lib/supabase'
import { supabaseAdmin } from '../../../../../lib/supabaseAdmin'
import AppHeader from '../../../../../components/AppHeader'

export const dynamic = 'force-dynamic'

export default async function CompletionPackPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params

  const { data: job } = await supabase
    .from('jobs_view')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()

  const { data: notes } = await supabase
    .from('job_notes')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  const { data: photos } = await supabase
    .from('photos')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: false })

  const { data: scaffoldRecord } = await supabase
    .from('scaffold_records')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()

  const { data: asbestosRecord } = await supabase
    .from('asbestos_records')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()

const { data: completionReport } = await supabase
  .from('completion_reports')
  .select('*')
  .eq('job_id', jobId)
  .maybeSingle()

 if (!job) {
  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="max-w-5xl mx-auto p-6">
        <Link
          href="/jobs"
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition cursor-pointer"
        >
          ← Back to Jobs
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl p-6 mt-6">
          <h1 className="text-xl font-bold text-slate-900">
            Job not found
          </h1>
        </div>
      </div>
    </main>
  )
}

  const { data: ticketWorkflowRecords } = await supabase
  .from('job_rams')
  .select(`
    id,
    completed_at,
    signed_by,
    operative_id,
    answers
  `)
  .eq('job_id', jobId)
  .eq('template_code', 'TICKET')
  .order('created_at', { ascending: false })
  .limit(1)

const ticketWorkflow =
  ticketWorkflowRecords?.[0] || null

const { data: partnerCompletion } = await supabaseAdmin
  .from('partner_job_completions')
  .select(`
    id,
    partner_name,
    completed_by,
    work_completed,
    completed_at,
    signature_data_url
  `)
  .eq('job_id', jobId)
  .maybeSingle()

  return (
  <main className="min-h-screen bg-slate-100">
    <AppHeader active="jobs" />

    <div className="max-w-5xl mx-auto p-6">
      <Link
        href={`/jobs/${jobId}/documents`}
        className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition cursor-pointer"
      >
        ← Back to Documents
      </Link>

      <div className="mt-6 mb-8">
        <p className="text-xs uppercase font-bold text-slate-400">
          Documents
        </p>

        <h1 className="text-3xl font-bold text-slate-900 mt-1">
          Completion Report
        </h1>

        <p className="text-slate-500 mt-2">
          Create and manage the completion report for this job.
        </p>
      </div>

      <div className="mb-8">
        <JobSummaryCard
          job={job}
          showClient={false}
          showStatus={false}
        />
      </div>

      <CompletionPackBuilder
        job={job}
        notes={notes || []}
        photos={photos || []}
        scaffoldRecord={scaffoldRecord}
        asbestosRecord={asbestosRecord}
        completionReport={completionReport}
        ticketWorkflow={ticketWorkflow}
        partnerCompletion={partnerCompletion}
      />
    </div>
  </main>
)
}