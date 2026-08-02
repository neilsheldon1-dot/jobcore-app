import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const recordId = body?.recordId
    const jobId = body?.jobId
    const reasons = body?.reasons

    if (!recordId || typeof recordId !== 'string') {
      return NextResponse.json(
        { error: 'A valid workflow record ID is required' },
        { status: 400 }
      )
    }

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'A valid job ID is required' },
        { status: 400 }
      )
    }

    if (
      !Array.isArray(reasons) ||
      reasons.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please select at least one reason.' },
        { status: 400 }
      )
    }

    const { data: records, error: lookupError } = await supabase
      .from('job_rams')
      .select('id, answers')
      .eq('id', recordId)
      .eq('job_id', jobId)
      .limit(1)

    if (lookupError) {
      console.error('Cannot Start lookup error:', lookupError)

      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    const currentRecord = records?.[0] || null

    if (!currentRecord) {
      return NextResponse.json(
        { error: 'Workflow record not found' },
        { status: 404 }
      )
    }

    const existingAnswers =
      currentRecord.answers &&
      typeof currentRecord.answers === 'object' &&
      !Array.isArray(currentRecord.answers)
        ? currentRecord.answers
        : {}

    const { data: updatedRecords, error: updateError } =
      await supabase
        .from('job_rams')
        .update({
          answers: {
            ...existingAnswers,
            cannotStartReasons: reasons,
          },
        })
        .eq('id', recordId)
        .eq('job_id', jobId)
        .select('*')

    if (updateError) {
      console.error('Cannot Start update error:', updateError)

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const updatedRecord = updatedRecords?.[0] || null

    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Workflow could not be updated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      nextStep: 'cannot_start_comments',
    })
  } catch (error) {
    console.error('Cannot Start error:', error)

    return NextResponse.json(
      { error: 'Unexpected error saving reasons.' },
      { status: 500 }
    )
  }
}