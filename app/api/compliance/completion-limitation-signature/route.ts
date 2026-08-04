import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const recordId = body?.recordId
    const jobId = body?.jobId
    const signatureDataUrl = body?.signatureDataUrl

    if (!recordId || typeof recordId !== 'string') {
      return NextResponse.json(
        { error: 'A valid workflow record ID is required.' },
        { status: 400 }
      )
    }

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'A valid job ID is required.' },
        { status: 400 }
      )
    }

    if (
      !signatureDataUrl ||
      typeof signatureDataUrl !== 'string' ||
      !signatureDataUrl.startsWith('data:image/png;base64,')
    ) {
      return NextResponse.json(
        { error: 'A valid signature is required.' },
        { status: 400 }
      )
    }

    const { data: record, error: lookupError } =
      await supabaseAdmin
        .from('job_rams')
        .select('id, answers')
        .eq('id', recordId)
        .eq('job_id', jobId)
        .eq('template_code', 'TICKET')
        .maybeSingle()

    if (lookupError) {
      console.error(
        'Completion limitation signature lookup error:',
        lookupError
      )

      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    if (!record) {
      return NextResponse.json(
        { error: 'Workflow record not found.' },
        { status: 404 }
      )
    }

    const existingAnswers =
      record.answers &&
      typeof record.answers === 'object' &&
      !Array.isArray(record.answers)
        ? record.answers
        : {}

    if (existingAnswers.can_complete !== 'no') {
      return NextResponse.json(
        {
          error:
            'A completion limitation has not been recorded for this workflow.',
        },
        { status: 409 }
      )
    }

    const reportedAt = new Date().toISOString()

    const { data: updatedRecord, error: workflowError } =
      await supabaseAdmin
        .from('job_rams')
        .update({
          status: 'started_not_completed',
          completed_at: reportedAt,
          answers: {
            ...existingAnswers,
            completionLimitationSignature:
              signatureDataUrl,
            completionLimitationReportedAt:
              reportedAt,
          },
        })
        .eq('id', recordId)
        .eq('job_id', jobId)
        .eq('template_code', 'TICKET')
        .select('*')
        .maybeSingle()

    if (workflowError) {
      console.error(
        'Completion limitation workflow update error:',
        workflowError
      )

      return NextResponse.json(
        { error: workflowError.message },
        { status: 500 }
      )
    }

    if (!updatedRecord) {
      return NextResponse.json(
        {
          error:
            'The incomplete work report could not be saved.',
        },
        { status: 500 }
      )
    }

    const { data: reviewStatus, error: statusError } =
      await supabaseAdmin
        .from('job_statuses')
        .select('id')
        .eq('name', 'Needs Review')
        .maybeSingle()

    if (statusError || !reviewStatus) {
      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'Needs Review status could not be found.',
        },
        { status: 500 }
      )
    }

    const { data: updatedJob, error: jobError } =
      await supabaseAdmin
        .from('jobs')
        .update({
          status_id: reviewStatus.id,
          assigned_user_id: null,
        })
        .eq('id', jobId)
        .select('id, status_id, assigned_user_id')
        .maybeSingle()

    if (jobError) {
      console.error(
        'Completion limitation office handover error:',
        jobError
      )

      return NextResponse.json(
        {
          error:
            'The report was saved, but the job could not be moved to Needs Review.',
        },
        { status: 500 }
      )
    }

    if (!updatedJob) {
      return NextResponse.json(
        {
          error:
            'The report was saved, but the office handover could not be confirmed.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      job: updatedJob,
      nextStep: 'complete',
    })
  } catch (error) {
    console.error(
      'Completion limitation signature error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unexpected error saving the incomplete work report.',
      },
      { status: 500 }
    )
  }
}