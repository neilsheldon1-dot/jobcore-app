import AppHeader from '../../../components/AppHeader'
import EditJobDetailsForm from './EditJobDetailsForm'
import UrgentButtons from './UrgentButtons'
import Link from 'next/link'
import PhotoGallery from './PhotoGallery'
import AddNoteForm from './AddNoteForm'
import { supabase } from '../../../lib/supabase'
import StatusDropdown from './StatusDropdown'
import JobTypeDropdown from './JobTypeDropdown'
import BlockerDropdown from './BlockerDropdown'
import DeleteJobButton from './DeleteJobButton'
import ScaffoldStatusDropdown from './ScaffoldStatusDropdown'
import AsbestosStatusDropdown from './AsbestosStatusDropdown'
import ScaffoldRecordPanel from './ScaffoldRecordPanel'
import EditDescriptionForm from './EditDescriptionForm'
import CopyButton from '../../../components/CopyButton'
export const dynamic = 'force-dynamic'
import EditableNote from './EditableNote'

type JobPageProps = {
  params: Promise<{
    jobId: string
  }>
}

export default async function JobPage({ params }: JobPageProps) {
  const { jobId } = await params

  const { data: job, error } = await supabase
    .from('jobs_view')
    .select('*')
    .eq('job_id', jobId)
    .maybeSingle()

const {
  data: { user },
} = await supabase.auth.getUser()

const loggedInName =
  user?.email === 'neil.sheldon1@gmail.com'
    ? 'Neil Sheldon'
    : user?.email || ''

  const { data: workflowJob } = await supabase
    .from('jobs')
    .select('scaffold_status_id, asbestos_status_id')
    .eq('id', jobId)
    .single()

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

  const { data: jobStatuses } = await supabase
    .from('job_statuses')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const { data: scaffoldStatuses } = await supabase
    .from('scaffold_statuses')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: asbestosStatuses } = await supabase
    .from('asbestos_statuses')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: jobTypes } = await supabase
    .from('job_types')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  const { data: activeJobTypeLinks } = await supabase
  .from('job_type_links')
  .select(`
    *,
    job_types (
      name
    )
  `)
  .eq('job_id', jobId)

  const activeJobTypes = (activeJobTypeLinks || [])
  .map((link) => {
    const matchingType = (jobTypes || []).find(
      (type) => type.id === link.job_type_id
    )

    return {
      ...link,
      job_types: matchingType || null,
    }
  })
  .sort((a, b) =>
    (a.job_types?.name || '').localeCompare(b.job_types?.name || '')
  
  )

const { data: scaffoldRecord } = await supabase
  .from('scaffold_records')
  .select('*')
  .eq('job_id', jobId)
  .maybeSingle()

  const { data: blockerTypes } = await supabase
    .from('blocker_types')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const { data: activeBlockers } = await supabase
    .from('job_blocker_links')
    .select(`
      *,
      blocker_types (
        name,
        colour
      )
    `)
    .eq('job_id', jobId)

const showScaffoldWorkflow =
  activeBlockers?.some(
    (blocker: any) =>
      blocker.blocker_types?.name?.toLowerCase() === 'scaffold'
  ) ||
  !!scaffoldRecord

const showAsbestosWorkflow =
  activeBlockers?.some(
    (blocker: any) =>
      blocker.blocker_types?.name?.toLowerCase() === 'asbestos'
  ) ?? false

  if (error || !job) {
    return (
      <main className="min-h-screen bg-slate-100">
        <AppHeader active="jobs" />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Job not found
          </h1>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <AppHeader active="jobs" />

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Job Details
            </h1>

            <p className="text-sm text-slate-500">
              {job.address_line_1} • {job.town}
            </p>
          </div>

          <EditJobDetailsForm
            job={job}
            jobStatuses={jobStatuses || []}
            jobTypes={jobTypes || []}
          />

          <UrgentButtons jobId={jobId} urgent={job.urgent} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 grid gap-6">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="grid gap-5">

            <div className="grid md:grid-cols-4 gap-4">
             
             
             <div>
  <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">
    Job / PO Number
  </p>

  <div className="flex items-center gap-2">
    <p className="text-sm font-bold text-slate-900">
      {[job.job_number, job.po_number]
        .filter(Boolean)
        .join(' / ') || 'Not Added'}
    </p>

    <CopyButton
      value={[
        job.job_number,
        job.po_number,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  </div>
</div>

              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">
                  Quote Number
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {job.quote_number || 'Not Added'}
                </p>
              </div>

              <div>
                <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">
                  Invoice Number
                </p>
                <p className="text-sm font-bold text-slate-400">
                  Future
                </p>
              </div>
            </div>

            <div className="grid gap-5">
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">
                    Status
                  </p>

                  <StatusDropdown
                    jobId={jobId}
                    currentStatus={job.status}
                    jobStatuses={jobStatuses || []}
                  />
                </div>

                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">
                    Job Type
                  </p>

                  <JobTypeDropdown
                    jobId={jobId}
                    jobTypes={jobTypes || []}
                    currentJobTypes={activeJobTypes || []}
                  />
                </div>

                <div>
                  <p className="text-xs uppercase font-bold text-slate-400">
                    Waiting On
                  </p>

                  <BlockerDropdown
                    jobId={jobId}
                    blockerTypes={blockerTypes || []}
                    currentBlockers={activeBlockers || []}
                  />
                </div>
                
              </div>

              
            </div>

            <div className="border-t border-slate-200 mt-6 pt-6 grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase font-bold text-slate-400">
                  Address
                </p>
                <div className="flex items-center gap-2">
  <p className="text-slate-900">
    {job.address_line_1}
  </p>

  <CopyButton
    value={[
      job.address_line_1,
      job.town,
      job.postcode,
    ]
      .filter(Boolean)
      .join('\n')}
  />
</div>
                <p className="text-slate-600">
                  {job.town} {job.postcode}
                </p>
              </div>

              <div>
  <p className="text-xs uppercase font-bold text-slate-400">
    Tenant Contact
  </p>

  <div className="flex items-center gap-2">
    <p className="text-slate-700 break-words">
      {job.tenant_contact || 'No Contact Added'}
    </p>

    {job.tenant_contact && (
      <CopyButton value={job.tenant_contact} />
    )}
  </div>
</div>
            </div>

{(showScaffoldWorkflow || showAsbestosWorkflow) && (
                <div className="border-t border-slate-200 mt-3 pt-5 grid md:grid-cols-2 gap-6">
                  {showScaffoldWorkflow && (
                    <div>
                      <p className="text-xs uppercase font-bold text-slate-400 mb-2">
                        Scaffold Workflow / Record
                      </p>

                      
<ScaffoldRecordPanel
  jobId={jobId}
  scaffoldRecord={scaffoldRecord}
  job={job}
/>
                      
                    </div>
                  )}

                  {showAsbestosWorkflow && (
                    <div>
                      <p className="text-xs uppercase font-bold text-slate-400 mb-2">
                        Asbestos Workflow
                      </p>

                      <AsbestosStatusDropdown
                        jobId={jobId}
                        currentStatusId={workflowJob?.asbestos_status_id || null}
                        statuses={asbestosStatuses || []}
                      />
                    </div>
                  )}
                </div>
              )}

            <div className="border-t border-slate-200 mt-6 pt-6">
  <p className="text-xs uppercase font-bold text-slate-400 mb-2">
    Work Description
  </p>

  <EditDescriptionForm
    jobId={jobId}
    currentDescription={job.description}
  />
</div>


            <div className="border-t border-slate-200 mt-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">
                  Job Notes
                </h2>

                <AddNoteForm jobId={jobId} />
              </div>

              {notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border-b pb-4 last:border-b-0">
                      <p className="text-xs text-slate-400 uppercase font-bold">
                        {note.note_type || 'Note'} • {note.created_by || 'Unknown'}
                      </p>


                      
  <EditableNote
  note={note}
  canEdit={true}
/>

<p className="text-xs text-slate-400 mt-1">
                        {new Date(note.created_at).toLocaleString('en-GB')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  No notes added yet.
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 mt-6 pt-6">
              <PhotoGallery
                photos={photos ?? []}
                jobId={jobId}
                jobAddress={`${job.address_line_1}, ${job.town} ${job.postcode}`}
              />
            </div>
          </div>
        </section>

        <div className="pb-8 flex items-center justify-between">
          <Link href="/jobs" className="text-blue-600 font-bold">
            ← Back to Jobs
          </Link>

          <DeleteJobButton jobId={jobId} />
        </div>
      </div>
    </main>
  )
}