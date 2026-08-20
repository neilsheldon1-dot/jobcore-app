import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

function formatReason(reason: string) {
  return reason
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    )
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const recordId = body?.recordId
    const jobId = body?.jobId
    const signatureDataUrl =
      body?.signatureDataUrl

    if (
      !recordId ||
      typeof recordId !== 'string'
    ) {
      return NextResponse.json(
        {
          error:
            'A valid workflow record ID is required.',
        },
        { status: 400 }
      )
    }

    if (
      !jobId ||
      typeof jobId !== 'string'
    ) {
      return NextResponse.json(
        {
          error:
            'A valid job ID is required.',
        },
        { status: 400 }
      )
    }

    if (
      !signatureDataUrl ||
      typeof signatureDataUrl !== 'string' ||
      !signatureDataUrl.startsWith(
        'data:image/png;base64,'
      )
    ) {
      return NextResponse.json(
        {
          error:
            'A valid signature is required.',
        },
        { status: 400 }
      )
    }

    const {
      data: records,
      error: lookupError,
    } = await supabaseAdmin
      .from('job_rams')
      .select(
        'id, operative_id, answers'
      )
      .eq('id', recordId)
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')
      .limit(1)

    if (lookupError) {
      console.error(
        'Cannot Start signature lookup error:',
        lookupError
      )

      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    const currentRecord =
      records?.[0] || null

    if (!currentRecord) {
      return NextResponse.json(
        {
          error:
            'Workflow record not found.',
        },
        { status: 404 }
      )
    }

    const existingAnswers =
      currentRecord.answers &&
      typeof currentRecord.answers ===
        'object' &&
      !Array.isArray(
        currentRecord.answers
      )
        ? currentRecord.answers
        : {}

    const completedAt =
      new Date().toISOString()

    const {
      data: updatedRecords,
      error: workflowUpdateError,
    } = await supabaseAdmin
      .from('job_rams')
      .update({
        status: 'not_started',
        completed_at: completedAt,
        answers: {
          ...existingAnswers,
          cannotStartSignature:
            signatureDataUrl,
          cannotStartCompletedAt:
            completedAt,
        },
      })
      .eq('id', recordId)
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')
      .select('*')

    if (workflowUpdateError) {
      console.error(
        'Cannot Start signature update error:',
        workflowUpdateError
      )

      return NextResponse.json(
        {
          error:
            workflowUpdateError.message,
        },
        { status: 500 }
      )
    }

    const updatedRecord =
      updatedRecords?.[0] || null

    if (!updatedRecord) {
      return NextResponse.json(
        {
          error:
            'Workflow could not be completed.',
        },
        { status: 500 }
      )
    }

    const {
      data: reviewStatus,
      error: statusError,
    } = await supabaseAdmin
      .from('job_statuses')
      .select('id, name')
      .eq('name', 'Needs Review')
      .maybeSingle()

    if (
      statusError ||
      !reviewStatus
    ) {
      console.error(
        'Needs Review status lookup error:',
        statusError
      )

      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'Needs Review status could not be found.',
        },
        { status: 500 }
      )
    }

    const {
      data: updatedJobs,
      error: jobUpdateError,
    } = await supabaseAdmin
      .from('jobs')
      .update({
        status_id: reviewStatus.id,
        assigned_user_id: null,
      })
      .eq('id', jobId)
      .select(
        'id, status_id, assigned_user_id'
      )

    if (jobUpdateError) {
      console.error(
        'Cannot Start handover error:',
        jobUpdateError
      )

      return NextResponse.json(
        {
          error:
            'The Cannot Start report was saved, but the job could not be moved to Needs Review.',
        },
        { status: 500 }
      )
    }

    const updatedJob =
      updatedJobs?.[0] || null

    if (!updatedJob) {
      return NextResponse.json(
        {
          error:
            'The Cannot Start report was saved, but the office handover could not be confirmed.',
        },
        { status: 500 }
      )
    }

    /*
     * A completed site visit should leave useful
     * knowledge behind for the next operative.
     *
     * The workflow record remains the formal
     * evidence. This shared note surfaces the
     * useful site information on future visits.
     */
    const cannotStartReasons =
      Array.isArray(
        existingAnswers.cannotStartReasons
      )
        ? existingAnswers.cannotStartReasons.filter(
  (
    reason: unknown
  ): reason is string =>
    typeof reason === 'string' &&
    reason.trim().length > 0
)
        : []

    const cannotStartComments =
      typeof existingAnswers.cannotStartComments ===
      'string'
        ? existingAnswers.cannotStartComments.trim()
        : ''

    const reasonText =
      cannotStartReasons.length > 0
        ? cannotStartReasons
            .map(formatReason)
            .join(', ')
        : ''

    const noteParts = [
      cannotStartComments,
      reasonText
        ? `Reason: ${reasonText}`
        : '',
    ].filter(Boolean)

    const sharedNote =
      noteParts.join('\n')

    if (sharedNote) {
      let createdBy =
        'Site Operative'

      if (
        currentRecord.operative_id
      ) {
        const {
          data: operativeProfile,
        } = await supabaseAdmin
          .from('profiles')
          .select(
            'display_name, full_name, email'
          )
          .eq(
            'id',
            currentRecord.operative_id
          )
          .maybeSingle()

        createdBy =
          operativeProfile?.display_name ||
          operativeProfile?.full_name ||
          operativeProfile?.email ||
          'Site Operative'
      }

      /*
       * Avoid creating an identical shared note
       * if the final submission is retried.
       */
      const {
        data: existingSharedNote,
      } = await supabaseAdmin
        .from('job_notes')
        .select('id')
        .eq('job_id', jobId)
        .eq(
          'internal_only',
          false
        )
        .eq(
          'content',
          sharedNote
        )
        .maybeSingle()

      if (!existingSharedNote) {
        const {
          error: noteError,
        } = await supabaseAdmin
          .from('job_notes')
          .insert([
            {
              job_id: jobId,
              content: sharedNote,
              note_type: 'General',
              internal_only: false,
              created_by:
                createdBy,
            },
          ])

        if (noteError) {
          console.error(
            'Could not create shared site information note:',
            noteError
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      job: updatedJob,
      nextStep: 'complete',
    })
  } catch (error) {
    console.error(
      'Cannot Start signature error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unexpected error saving the signature.',
      },
      { status: 500 }
    )
  }
}