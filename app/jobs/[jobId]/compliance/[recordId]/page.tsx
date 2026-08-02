import Link from 'next/link'
import AppHeader from '../../../../../components/AppHeader'
import { supabase } from '../../../../../lib/supabase'
import SiteArrivalStep from './SiteArrivalStep'
import CannotStartReasonStep from './CannotStartReasonStep'
import CannotStartCommentsStep from './CannotStartCommentsStep'
import CannotStartPhotosStep from './CannotStartPhotosStep'
import CannotStartSignatureStep from './CannotStartSignatureStep'

export const dynamic = 'force-dynamic'

type CompliancePageProps = {
  params: Promise<{
    jobId: string
    recordId: string
  }>
  searchParams: Promise<{
    step?: string
  }>
}

export default async function CompliancePage({
  params,
  searchParams,
}: CompliancePageProps) {
  const { jobId, recordId } = await params
  const { step } = await searchParams

  const { data: records, error } = await supabase
    .from('job_rams')
    .select('*')
    .eq('id', recordId)
    .eq('job_id', jobId)
    .limit(1)

  const record = records?.[0] || null

  const { data: jobs } = await supabase
    .from('jobs_view')
    .select('*')
    .eq('job_id', jobId)
    .limit(1)

  const job = jobs?.[0] || null

  if (error || !record || !job) {
    return (
      <main className="min-h-screen bg-slate-100">
        <AppHeader active="jobs" />

        <div className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Ticket workflow not found
          </h1>

          <Link
            href={`/jobs/${jobId}`}
            className="mt-4 inline-block font-bold text-blue-600"
          >
            ← Return to job
          </Link>
        </div>
      </main>
    )
  }

  const jobAddress = [
    job.address_line_1,
    job.address_line_2,
    job.town,
    job.postcode,
  ]
    .filter(Boolean)
    .join(', ')

  const cannotStartPhotoIds = Array.isArray(
    record.answers?.cannotStartPhotoIds
  )
    ? record.answers.cannotStartPhotoIds.filter(
        (photoId: unknown): photoId is string =>
          typeof photoId === 'string'
      )
    : []

  let cannotStartPhotos: any[] = []

  if (cannotStartPhotoIds.length > 0) {
    const { data: photos } = await supabase
      .from('photos')
      .select(
        'id, file_url, category, photo_group, created_at, uploaded_by'
      )
      .eq('job_id', jobId)
      .in('id', cannotStartPhotoIds)
      .order('created_at', {
        ascending: true,
      })

    cannotStartPhotos = photos || []
  }

  const currentStep =
    step ||
    (record.can_start === true
      ? 'rams_acceptance'
      : record.can_start === false
        ? 'cannot_start'
        : 'site_arrival')

  const stepMap: Record<string, number> = {
    site_arrival: 1,
    cannot_start: 2,
    cannot_start_comments: 3,
    cannot_start_photos: 4,
    cannot_start_signature: 5,
    rams_acceptance: 2,
    work_record: 3,
    havs: 4,
    completion: 5,
    complete: 6,
  }

  const stepNumber = stepMap[currentStep] ?? 1

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="border-b bg-white">
        <div className="mx-auto max-w-3xl px-6 py-6">
          <Link
            href={`/jobs/${jobId}`}
            className="text-sm font-bold text-blue-600"
          >
            ← Back to Job
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-slate-900">
            Ticket Workflow
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {jobAddress}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-bold text-slate-500">
            Step {stepNumber} of 6
          </p>

          <span className="rounded-full border border-amber-200 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            On Site
          </span>
        </div>

        <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-blue-600 transition-all duration-300"
            style={{
              width: `${(stepNumber / 6) * 100}%`,
            }}
          />
        </div>

        {currentStep === 'site_arrival' && (
          <SiteArrivalStep
            jobId={jobId}
            recordId={recordId}
            initialAnswer={record.can_start}
          />
        )}

        {currentStep === 'rams_acceptance' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              RAMS Acceptance
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Job can be started
            </h2>

            <p className="mt-3 text-slate-600">
              The Site Arrival answer has been saved successfully.
            </p>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-800">
                Continue to RAMS acceptance
              </p>
            </div>

            <Link
              href={`/jobs/${jobId}/compliance/${recordId}?step=site_arrival`}
              className="mt-6 inline-block text-sm font-bold text-blue-600"
            >
              ← Change site arrival answer
            </Link>
          </section>
        )}

        {currentStep === 'cannot_start' && (
          <CannotStartReasonStep
            jobId={jobId}
            recordId={recordId}
            initialReasons={
              record.answers?.cannotStartReasons ??
              []
            }
          />
        )}

        {currentStep ===
          'cannot_start_comments' && (
          <CannotStartCommentsStep
            jobId={jobId}
            recordId={recordId}
          />
        )}

        {currentStep === 'cannot_start_photos' && (
          <CannotStartPhotosStep
            jobId={jobId}
            recordId={recordId}
            jobAddress={jobAddress}
            initialPhotos={cannotStartPhotos}
          />
        )}

        {currentStep ===
          'cannot_start_signature' && (
          <CannotStartSignatureStep
            jobId={jobId}
            recordId={recordId}
          />
        )}

        {currentStep === 'complete' && (
          <section className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-green-600">
              Workflow Complete
            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Cannot Start record submitted
            </h2>

            <p className="mt-3 text-slate-600">
              The site record has been saved successfully and is ready for office review.
            </p>

            <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="font-bold text-green-800">
                Submission complete
              </p>

              {record.answers
                ?.cannotStartCompletedAt && (
                <p className="mt-1 text-sm text-green-700">
                  Completed{' '}
                  {new Date(
                    record.answers
                      .cannotStartCompletedAt
                  ).toLocaleString('en-GB')}
                </p>
              )}
            </div>

            <Link
              href={`/jobs/${jobId}`}
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              Return to Job
            </Link>
          </section>
        )}
      </div>
    </main>
  )
}