export function buildCompletionDocument({
  reportType = 'completion',
  job,
  notes,
  photos,
  scaffoldRecord,
  asbestosRecord,
  options,
}: any) {
  const selectedPhotos = photos.filter((photo: any) =>
    options.selectedPhotoIds.includes(photo.id)
  )

  const selectedNotes = notes.filter((note: any) => {
 if (
  note.internal_only &&
  options.includeInternalNotes &&
  options.selectedInternalNoteIds?.includes(note.id)
) {
  return true
}

  if (note.internal_only && options.includeInternalNotes) {
    return true
  }

  return false
})

  return {
    reportType,
    
    property: {
      address: [
        job.address_line_1,
        job.town,
        job.postcode,
      ]
        .filter(Boolean)
        .join(', '),

      client: job.client,

      jobNumber: job.job_number,

      poNumber: job.po_number,
    },

    description: options.includeDescription
      ? job.description
      : null,

    notes: selectedNotes.map((note: any) => ({
      author: note.created_by,
      content: note.content,
      created: note.created_at,
    })),

    photos: selectedPhotos.map((photo: any) => ({
  category: photo.category,
  photo_group: photo.photo_group,
  url: photo.file_url,
})),

summary: '',

    scaffold: {
      included: options.includeScaffold,
      exists: !!scaffoldRecord,
    },

    asbestos: {
      included: options.includeAsbestos,
      exists: !!asbestosRecord,
    },
  }
}