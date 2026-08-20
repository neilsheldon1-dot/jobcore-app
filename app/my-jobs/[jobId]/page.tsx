import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import WorkspaceHeader from '../../../components/WorkspaceHeader'
import { createClient } from '../../utils/supabase/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import JobStartPanel from './JobStartPanel'
import MobileCard from '../../../components/app/MobileCard'
import SectionTitle from '../../../components/app/SectionTitle'
import NavigationButton from '../../../components/app/NavigationButton'
import CallButton from '../../../components/app/CallButton'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{
    jobId: string
  }>
}

export default async function MyJobPage({
  params,
}: PageProps) {
  const { jobId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: job } = await supabaseAdmin
    .from('jobs_view')
    .select('*')
    .eq('job_id', jobId)
    .eq('assigned_user_id', user.id)
    .maybeSingle()

  if (!job) {
    notFound()
  }

  const { data: workflowRecord } =
    await supabaseAdmin
      .from('job_rams')
      .select(
        'id, job_id, status, can_start, accepted_at, answers, created_at'
      )
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')
      .order('created_at', {
        ascending: false,
      })
      .limit(1)
      .maybeSingle()

  const { data: existingBeforePhotos } =
    await supabaseAdmin
      .from('photos')
      .select(
        'id, file_url, category, photo_group, created_at, uploaded_by'
      )
      .eq('job_id', jobId)
      .eq('photo_group', 'Before')
      .order('created_at', {
        ascending: true,
      })

      const { data: sharedNotes } =
  await supabaseAdmin
    .from('job_notes')
    .select('id, content, created_at, created_by')
    .eq('job_id', jobId)
    .eq('internal_only', false)
    .order('created_at', {
      ascending: true,
    })

  const fullAddress = [
    job.address_line_1,
    job.town,
    job.postcode,
  ]
    .filter(Boolean)
    .join(', ')

  const googleMapsUrl =
    `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
      fullAddress
    )}`

  const appleMapsUrl =
    `https://maps.apple.com/?daddr=${encodeURIComponent(
      fullAddress
    )}&dirflg=d`

  const wazeUrl =
    `https://www.waze.com/ul?q=${encodeURIComponent(
      fullAddress
    )}&navigate=yes`

  return (
    <main className="min-h-screen bg-slate-100">
      <WorkspaceHeader />

      <div className="mx-auto max-w-md p-4">
        <Link
          href="/my-jobs"
          className="mb-5 inline-flex text-sm font-bold text-slate-600 hover:text-orange-600"
        >
          ← My Jobs
        </Link>

        <MobileCard>
          <h1 className="text-2xl font-black text-slate-900">
            {job.address_line_1}
          </h1>

          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <p className="text-slate-600">
                {[job.town, job.postcode]
                  .filter(Boolean)
                  .join(' ')}
              </p>

              {job.job_type && (
                <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
                  {job.job_type}
                </span>
              )}
            </div>

            <NavigationButton
              googleMapsUrl={googleMapsUrl}
              appleMapsUrl={appleMapsUrl}
              wazeUrl={wazeUrl}
            />
          </div>

          <hr className="my-4 border-slate-200" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <SectionTitle>
                Tenant Contact
              </SectionTitle>

              <p className="mt-2 whitespace-pre-wrap font-semibold text-slate-800">
                {job.tenant_contact ||
                  'No contact details added'}
              </p>
            </div>

            <CallButton
              contactText={job.tenant_contact}
            />
          </div>

          <hr className="my-4 border-slate-200" />

          <SectionTitle>
            Original Work Description
          </SectionTitle>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-800">
            {job.description ||
              'No work description added'}
          </p>

          {sharedNotes && sharedNotes.length > 0 && (
  <>
    <hr className="my-4 border-slate-200" />

    <SectionTitle>
      Additional Work / Site Information
    </SectionTitle>

    <div className="mt-3 space-y-3">
      {sharedNotes.map((note) => (
        <div
          key={note.id}
          className="rounded-xl border border-green-200 bg-green-50 p-3"
        >
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {note.content}
          </p>
        </div>
      ))}
    </div>
  </>
)}
        </MobileCard>

        <div className="mt-4">
          <JobStartPanel
            jobId={jobId}
            jobAddress={fullAddress}
            initialWorkflowRecord={
              workflowRecord || null
            }
            initialBeforePhotos={
              existingBeforePhotos || []
            }
          />
        </div>
      </div>
    </main>
  )
}