export function buildCompletionDocument({
  reportType = 'completion',
  job,
  notes,
  photos,
  scaffoldRecord,
  asbestosRecord,
  ticketWorkflow,
  partnerCompletion,
  options,
}: any) {
  const selectedPhotos = photos.filter(
    (photo: any) =>
      options.selectedPhotoIds.includes(
        photo.id
      )
  )

  const selectedNotes = notes.filter(
    (note: any) => {
      if (
        note.internal_only &&
        options.includeInternalNotes &&
        options.selectedInternalNoteIds?.includes(
          note.id
        )
      ) {
        return true
      }

      if (
        !note.internal_only &&
        options.includeGeneralNotes &&
        options.selectedGeneralNoteIds?.includes(
          note.id
        )
      ) {
        return true
      }

      return false
    }
  )

  const isPartnerCompletion =
    !!partnerCompletion

  const completion = isPartnerCompletion
    ? {
        source: 'partner',
        organisation:
          partnerCompletion.partner_name ||
          'Partner',
        completedBy:
          partnerCompletion.completed_by ||
          null,
        completedAt:
          partnerCompletion.completed_at ||
          null,
        workCompleted:
          partnerCompletion.work_completed ||
          null,
        signature:
          partnerCompletion.signature_data_url ||
          null,
      }
    : ticketWorkflow
      ? {
          source: 'rubber-roofs',
          organisation: 'Rubber Roofs',
          completedBy:
            ticketWorkflow.signed_by ||
            null,
          completedAt:
            ticketWorkflow.completed_at ||
            null,
          workCompleted:
            ticketWorkflow.answers
              ?.completion_notes ||
            ticketWorkflow.answers
              ?.completionNotes ||
            null,
          signature:
            ticketWorkflow.answers
              ?.completion_signature ||
            ticketWorkflow.answers
              ?.completionSignature ||
            null,
        }
      : null

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

    description:
      options.includeDescription
        ? job.description
        : null,

    completion,

    notes: selectedNotes.map(
      (note: any) => ({
        author: note.created_by,
        content: note.content,
        created: note.created_at,
      })
    ),

    photos: selectedPhotos.map(
      (photo: any) => ({
        category: photo.category,
        photo_group:
          photo.photo_group,
        url: photo.file_url,
      })
    ),

    summary: '',

    scaffold: {
      included:
        options.includeScaffold,
      exists: !!scaffoldRecord,
    },

    asbestos: {
      included:
        options.includeAsbestos,
      exists: !!asbestosRecord,
    },
  }
}