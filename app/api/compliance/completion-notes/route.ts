import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const recordId = body?.recordId
    const jobId = body?.jobId
    const notes = body?.notes

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

    if (typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Completion notes must be valid text' },
        { status: 400 }
      )
    }

    const { data: records, error: lookupError } =
      await supabase
        .from('job_rams')
        .select('id, answers')
        .eq('id', recordId)
        .eq('job_id', jobId)
        .limit(1)

    if (lookupError) {
      console.error(
        'Completion notes lookup error:',
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
            completionNotes: notes.trim(),
          },
        })
        .eq('id', recordId)
        .eq('job_id', jobId)
        .select('*')

    if (updateError) {
      console.error(
        'Completion notes update error:',
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
        { error: 'Workflow could not be updated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      nextStep: 'signature',
    })
  } catch (error) {
    console.error('Completion notes error:', error)

    return NextResponse.json(
      { error: 'Unexpected error saving completion notes.' },
      { status: 500 }
    )
  }
}