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

    const { data: records, error: lookupError } =
      await supabaseAdmin
        .from('job_rams')
        .select('id, answers')
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

    const currentRecord = records?.[0] || null

    if (!currentRecord) {
      return NextResponse.json(
        { error: 'Workflow record not found.' },
        { status: 404 }
      )
    }

    const existingAnswers =
      currentRecord.answers &&
      typeof currentRecord.answers === 'object' &&
      !Array.isArray(currentRecord.answers)
        ? currentRecord.answers
        : {}

    const completedAt = new Date().toISOString()

    const { data: updatedRecords, error: workflowUpdateError } =
      await supabaseAdmin
        .from('job_rams')
        .update({
          status: 'not_started',
          completed_at: completedAt,
          answers: {
            ...existingAnswers,
            cannotStartSignature: signatureDataUrl,
            cannotStartCompletedAt: completedAt,
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
        { error: workflowUpdateError.message },
        { status: 500 }
      )
    }

    const updatedRecord = updatedRecords?.[0] || null

    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Workflow could not be completed.' },
        { status: 500 }
      )
    }

    const { data: reviewStatus, error: statusError } =
      await supabaseAdmin
        .from('job_statuses')
        .select('id, name')
        .eq('name', 'Needs Review')
        .maybeSingle()

    if (statusError || !reviewStatus) {
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

    const { data: updatedJobs, error: jobUpdateError } =
      await supabaseAdmin
        .from('jobs')
        .update({
          status_id: reviewStatus.id,
          assigned_user_id: null,
        })
        .eq('id', jobId)
        .select('id, status_id, assigned_user_id')

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

    const updatedJob = updatedJobs?.[0] || null

    if (!updatedJob) {
      return NextResponse.json(
        {
          error:
            'The Cannot Start report was saved, but the office handover could not be confirmed.',
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
    console.error('Cannot Start signature error:', error)

    return NextResponse.json(
      { error: 'Unexpected error saving the signature.' },
      { status: 500 }
    )
  }
}