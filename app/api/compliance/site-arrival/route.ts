import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function PATCH(request: Request) {
  try {
    const body = await request.json()

    const recordId = body?.recordId
    const jobId = body?.jobId
    const canStart = body?.canStart

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

    if (typeof canStart !== 'boolean') {
      return NextResponse.json(
        { error: 'Please select whether the job can start' },
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
      console.error('Ticket workflow lookup error:', lookupError)

      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    const currentRecord = records?.[0] || null

    if (!currentRecord) {
      return NextResponse.json(
        { error: 'Ticket workflow record not found' },
        { status: 404 }
      )
    }

    const existingAnswers =
      currentRecord.answers &&
      typeof currentRecord.answers === 'object' &&
      !Array.isArray(currentRecord.answers)
        ? currentRecord.answers
        : {}

    const { data: updatedRecords, error: updateError } = await supabase
      .from('job_rams')
      .update({
        can_start: canStart,
        status: 'in_progress',
        answers: {
          ...existingAnswers,
          can_start: canStart ? 'yes' : 'no',
        },
      })
      .eq('id', recordId)
      .eq('job_id', jobId)
      .select('*')

    if (updateError) {
      console.error('Ticket workflow update error:', updateError)

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const updatedRecord = updatedRecords?.[0] || null

    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Ticket workflow could not be updated' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      record: updatedRecord,
      nextStep: canStart
        ? 'rams_acceptance'
        : 'cannot_start',
    })
  } catch (error) {
    console.error('Site arrival update error:', error)

    return NextResponse.json(
      { error: 'Unexpected error saving site arrival' },
      { status: 500 }
    )
  }
}