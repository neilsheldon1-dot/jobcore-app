import PhotoUploadForm from './PhotoUploadForm'

import AddNoteForm from './AddNoteForm'

import { supabase } from '../../../lib/supabase'

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
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8">Job Details</h1>

      <div className="bg-white rounded-3xl shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-sm text-gray-500 uppercase">Job Number</h2>
          <p className="text-2xl font-bold">{job.job_number || 'Not Assigned'}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Address</h2>
          <p className="text-xl">{job.address_line_1}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Town</h2>
          <p className="text-xl">{job.town}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Status</h2>
          <p className="text-xl font-bold">{job.status}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Job Type</h2>
          <p className="text-xl">{job.job_type}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Tenant Contact</h2>
          <p className="text-xl">{job.tenant_contact || 'No Contact Added'}</p>
        </div>

        <div>
          <h2 className="text-sm text-gray-500 uppercase">Work Description</h2>
          <p className="text-xl whitespace-pre-wrap">
            {job.description || 'No work description added'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
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
      <AddNoteForm jobId={jobId} />
<div className="bg-white rounded-3xl shadow-lg p-8 mt-8">
  <h2 className="text-2xl font-bold mb-6">
    Job Photos
  </h2>

  {photos && photos.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <div
          key={photo.id}
          className="border rounded-2xl overflow-hidden bg-gray-50"
        >
          <img
            src={photo.file_url}
            alt="Job Photo"
            className="w-full h-48 object-cover"
          />

          <div className="p-3">
            <p className="text-sm font-bold uppercase">
              {photo.category}
            </p>

            <p className="text-xs text-gray-500">
              Uploaded by {photo.uploaded_by}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {new Date(photo.created_at).toLocaleString('en-GB')}
            </p>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">
      No photos uploaded yet.
    </p>
  )}
</div>
      <PhotoUploadForm jobId={jobId} />
    </main>
  )
}