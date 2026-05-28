import AppHeader from '../../../components/AppHeader'
import BlockerButtons from './BlockerButtons'
import EditJobDetailsForm from './EditJobDetailsForm'
import UrgentButtons from './UrgentButtons'
import Link from 'next/link'
import PhotoGallery from './PhotoGallery'
import PhotoUploadForm from './PhotoUploadForm'
import AddNoteForm from './AddNoteForm'
import { supabase } from '../../../lib/supabase'
import WorkflowControls from './WorkflowControls'
import StatusDropdown from './StatusDropdown'
import JobTypeDropdown from './JobTypeDropdown'
import BlockerDropdown from './BlockerDropdown'

export const dynamic = 'force-dynamic'

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

  const { data: jobTypes } = await supabase
    .from('job_types')
    .select('*')
    .eq('is_active', true)
    .order('id', { ascending: true })

const { data: activeJobTypeLinks } = await supabase
  .from('job_type_links')
  .select('*')
  .eq('job_id', jobId)

const activeJobTypes = (activeJobTypeLinks || []).map((link) => {
  const matchingType = (jobTypes || []).find(
    (type) => type.id === link.job_type_id
  )

  return {
    ...link,
    job_types: matchingType
      ? { name: matchingType.name }
      : null,
  }
})

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

  {/* Reference Numbers */}
  <div className="grid md:grid-cols-4 gap-4">

    <div>
      <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">
        Job Number
      </p>

      <p className="text-sm font-bold text-slate-900">
        {job.job_number || 'Not Assigned'}
      </p>
    </div>

    <div>
      <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wide">
        PO Number
      </p>

      <p className="text-sm font-bold text-slate-900">
        {job.po_number || 'Not Added'}
      </p>
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

  {/* Operational Controls */}
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
              <p className="text-slate-900 font-semibold">
                {job.address_line_1}
              </p>
              <p className="text-slate-600">
                {job.town} {job.postcode}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-slate-400">
                Tenant Contact
              </p>
              <p className="text-slate-700 break-words">
                {job.tenant_contact || 'No Contact Added'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-6 pt-6">
            <p className="text-xs uppercase font-bold text-slate-400">
              Work Description
            </p>
            <p className="text-slate-700 whitespace-pre-wrap break-words mt-1">
              {job.description || 'No work description added'}
            </p>
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

                  <p className="text-slate-700 whitespace-pre-wrap mt-1">
                    {note.content}
                  </p>

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
/>
</div>
          
        </section>

       

       


    
      

        <div className="pb-8">
          <Link
            href="/jobs"
            className="text-blue-600 font-bold"
          >
            ← Back to Jobs
          </Link>
        </div>

      </div>
    </main>
  )
}