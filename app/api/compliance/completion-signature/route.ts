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
        'Completion signature lookup error:',
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

    const { data: updatedRecords, error: updateError } =
      await supabaseAdmin
        .from('job_rams')
        .update({
          status: 'completed',
          completed_at: completedAt,
          answers: {
            ...existingAnswers,
            completionSignature: signatureDataUrl,
            completionCompletedAt: completedAt,
          },
        })
        .eq('id', recordId)
        .eq('job_id', jobId)
        .eq('template_code', 'TICKET')
        .select('*')

    if (updateError) {
      console.error(
        'Completion signature update error:',
        updateError
      )

      return NextResponse.json(
        { error: updateError.message },
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

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      nextStep: 'complete',
    })
  } catch (error) {
    console.error('Completion signature error:', error)

    return NextResponse.json(
      { error: 'Unexpected error saving the signature.' },
      { status: 500 }
    )
  }
}