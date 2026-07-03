type AIContextPanelProps = {
  job: any
  notes: any[]
  photos: any[]
  scaffoldRecord: any
  asbestosRecord: any
  options: {
    includeDescription: boolean
    includeGeneralNotes: boolean
    includeInternalNotes: boolean
    includePhotos: boolean
    includeScaffold: boolean
    includeAsbestos: boolean
    selectedPhotoIds: string[]
  }
}

export default function AIContextPanel({
  job,
  notes,
  photos,
  scaffoldRecord,
  asbestosRecord,
  options,
}: AIContextPanelProps) {
  const selectedPhotos = photos.filter((photo) =>
    options.selectedPhotoIds.includes(photo.id)
  )

  const selectedNotes = notes.filter((note) => {
    if (!note.internal_only && options.includeGeneralNotes) return true
    if (note.internal_only && options.includeInternalNotes) return true
    return false
  })

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mt-6">
      <p className="text-xs uppercase font-bold text-slate-400 mb-3">
        AI Context
      </p>

      <div className="space-y-5 text-sm">
        <section>
          <h3 className="font-bold text-slate-900 mb-1">
            Job Description
          </h3>

          <p className="whitespace-pre-wrap text-slate-700">
            {options.includeDescription
              ? job?.description || 'No description provided.'
              : 'Not included.'}
          </p>
        </section>

        <section>
          <h3 className="font-bold text-slate-900 mb-1">
            Notes
          </h3>

          {selectedNotes.length > 0 ? (
            <ul className="list-disc pl-5 text-slate-700 space-y-1">
              {selectedNotes.map((note) => (
                <li key={note.id}>{note.content}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">No notes included.</p>
          )}
        </section>

        <section>
          <h3 className="font-bold text-slate-900 mb-1">
            Photos
          </h3>

          <p className="text-slate-700">
            {options.includePhotos
              ? `${selectedPhotos.length} selected`
              : 'Not included.'}
          </p>
        </section>

        <section>
          <h3 className="font-bold text-slate-900 mb-1">
            Workflows
          </h3>

          <div className="space-y-1 text-slate-700">
            <p>
              Scaffold included:{' '}
              <span className="font-bold">
                {options.includeScaffold ? 'Yes' : 'No'}
              </span>
            </p>

            <p>
              Scaffold record exists:{' '}
              <span className="font-bold">
                {scaffoldRecord ? 'Yes' : 'No'}
              </span>
            </p>

            <p>
              Asbestos included:{' '}
              <span className="font-bold">
                {options.includeAsbestos ? 'Yes' : 'No'}
              </span>
            </p>

            <p>
              Asbestos record exists:{' '}
              <span className="font-bold">
                {asbestosRecord ? 'Yes' : 'No'}
              </span>
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}