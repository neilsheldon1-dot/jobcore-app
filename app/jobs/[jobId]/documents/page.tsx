import Link from 'next/link'
import FeatureCard from '@/components/FeatureCard'
import JobSummaryCard from '@/components/JobSummaryCard'
import { supabase } from '../../../../lib/supabase'
import AppHeader from '../../../../components/AppHeader'

export const dynamic = 'force-dynamic'

export default async function DocumentsPage({
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

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="max-w-5xl mx-auto p-6">
        <Link
          href={`/jobs/${jobId}`}
          className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition cursor-pointer"
        >
          ← Back to Job
        </Link>

        <div className="mt-6 mb-8">
          <p className="text-xs uppercase font-bold text-slate-400">
            Documents
          </p>

          <h1 className="text-3xl font-bold text-slate-900 mt-1">
            Documents
          </h1>

          <p className="text-slate-500 mt-2">
            Generate reports and document packs for this job.
          </p>
        </div>

        <div className="mb-8">
          <JobSummaryCard
            job={job}
            showClient={false}
            showStatus={false}
          />
        </div>

        <div className="space-y-4">
          <FeatureCard
            icon="📄"
            title="Completion Pack"
            description="Produce a complete record of the works including notes, photos and workflow history."
            href={`/jobs/${jobId}/documents/completion-pack`}
          />

          <FeatureCard
            icon="🔎"
            title="Inspection Report"
            description="Create an inspection report with findings, notes and photographic evidence."
            href={`/jobs/${jobId}/documents/inspection-report`}
          />

          <FeatureCard
            icon="📋"
            title="Handover Pack"
            description="Produce a handover pack for completed works."
            disabled
          />

          <FeatureCard
            icon="⚠️"
            title="RAMS Pack"
            description="Generate RAMS documentation."
            disabled
          />

          <FeatureCard
            icon="💷"
            title="Invoice Pack"
            description="Generate invoice supporting documents."
            disabled
          />
        </div>
      </div>
    </main>
  )
}