import EditJobDetailsForm from './EditJobDetailsForm'
import JobTypeButtons from './JobTypeButtons'
import UrgentButtons from './UrgentButtons'
import Link from 'next/link'
import StatusButtons from './StatusButtons'
import PhotoGallery from './PhotoGallery'
import PhotoUploadForm from './PhotoUploadForm'
import AddNoteForm from './AddNoteForm'
import { supabase } from '../../../lib/supabase'

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

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Job Error</h1>
        <pre className="bg-black text-green-400 p-4 rounded-xl text-xs overflow-auto">
          {JSON.stringify(error, null, 2)}
        </pre>
      </main>
    )
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold mb-4">Job not found</h1>
        <p>No job was found for this ID:</p>
        <pre className="bg-black text-green-400 p-4 rounded-xl mt-4 text-xs overflow-auto">
          {jobId}
        </pre>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-blue-100 p-3 md:p-8">
  <h1 className="text-2xl md:text-4xl font-bold mb-4 md:mb-8">Job Details</h1>

      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-sm text-gray-500 uppercase">Job Number</h2>
          <p className="text-2xl font-bold">{job.job_number || 'Not Assigned'}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Address</h2>
          <p className="text-base md:text-xl break-words">{job.address_line_1}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Town</h2>
          <p className="text-base md:text-xl break-words">{job.town}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Status</h2>
          <p
  className={`text-sm md:text-base border border-gray-200 font-bold px-3 py-1 rounded-xl inline-block ${
    job.status === 'Ticket'
      ? 'bg-pink-500 text-white'
      : job.status === 'Needs Quoting'
      ? 'bg-purple-300 text-white'
      : job.status === 'Awaiting Approval'
      ? 'bg-orange-500 text-white'
      : job.status === 'Awaiting Scaffolding'
      ? 'bg-red-900 text-white'
      : job.status === 'Ready'
      ? 'bg-emerald-200 text-emerald-800'
      : job.status === 'Scaffold Ready'
      ? 'bg-green-900 text-white'
      : job.status === 'Needs Invoicing'
      ? 'bg-blue-900 text-white'
      : job.status === 'Awaiting Asbestos Removal'
      ? 'bg-sky-500 text-white'
      : job.status === 'Awaiting Gas Engineer'
      ? 'bg-yellow-700 text-white'
      : job.status === 'Awaiting Solar Contractor'
      ? 'bg-yellow-300 text-black'
      : job.status === 'Awaiting TV Contractor'
      ? 'bg-zinc-600 text-white'
      : job.status === 'Awaiting Materials'
      ? 'bg-purple-500 text-white'
      : job.status === 'Access Issue'
      ? 'bg-teal-400 text-white'
      : 'bg-gray-500 text-white'
  }`}
>
  {job.status}
</p>
        </div>

<div>
  <h2 className="text-sm text-gray-500 uppercase">Job Type</h2>
  <p
    className={`text-sm md:text-base border border-gray-200 font-bold px-3 py-1 rounded-xl inline-block ${
      job.job_type === 'Reactive'
        ? 'bg-lime-300 text-teal-800'
        : job.job_type === 'Flat Roof'
        ? 'bg-sky-400 text-white'
        : job.job_type === 'Re Roof'
        ? 'bg-amber-200 text-indigo-900'
        : job.job_type === 'Sika Roof'
        ? 'bg-cyan-900 text-cyan-100'
        : job.job_type === 'Roofline / EPS'
        ? 'bg-orange-400 text-white'
        : job.job_type === 'Hydro'
        ? 'bg-blue-200 text-cyan-900'
        : job.job_type === 'Scheme'
        ? 'bg-amber-900 text-amber-200'
        : 'bg-slate-200 text-slate-700'
    }`}
  >
    {job.job_type || 'No Type Set'}
  </p>
</div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Tenant Contact</h2>
          <p className="text-base md:text-xl break-words">{job.tenant_contact || 'No Contact Added'}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Work Description</h2>
          <p className="text-base md:text-xl whitespace-pre-wrap break-words">
            {job.description || 'No work description added'}
          </p>
          
          <div className="fixed top-4 right-4 z-50">
  <UrgentButtons jobId={jobId} urgent={job.urgent} />
</div>

<div className="mt-6 text-center">
  <EditJobDetailsForm job={job} />
</div>
        </div>
      </div>
      
      
      <div className="mt-8 text-center">
  <Link
    href="/"
    className="inline-block bg-black text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition"
  >
    ← Back to Dashboard
  </Link>
</div>
<StatusButtons jobId={jobId} />
<JobTypeButtons jobId={jobId} />



      <div className="bg-white border border-gray-200 rounded-3xl shadow-lg p-8 mt-8">
        <h2 className="text-2xl font-bold mb-4">Job Notes</h2>

        {notes && notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border-b pb-4">
                <p className="text-sm text-gray-500 uppercase">
                  {note.note_type || 'Note'} • {note.created_by || 'Unknown'}
                </p>

                <p className="text-lg whitespace-pre-wrap">
                  {note.content}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(note.created_at).toLocaleString('en-GB')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No notes added yet.</p>
        )}
      </div>


      <PhotoGallery photos={photos ?? []} />
      <AddNoteForm jobId={jobId} />

      <PhotoUploadForm jobId={jobId} />
    </main>
  )
}