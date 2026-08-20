import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function PATCH(request: Request) {
  try {
    
    const body = await request.json()
console.log('CANNOT START COMMENTS ROUTE HIT')
console.log('COMMENTS BODY:', body)
    const recordId = body?.recordId
    const jobId = body?.jobId

    const comments =
      typeof body?.comments === 'string'
        ? body.comments.trim()
        : ''

    if (!recordId || typeof recordId !== 'string') {
      return NextResponse.json(
        {
          error:
            'A valid workflow record ID is required',
        },
        { status: 400 }
      )
    }

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        {
          error:
            'A valid job ID is required',
        },
        { status: 400 }
      )
    }

    const {
      data: records,
      error: lookupError,
    } = await supabaseAdmin
      .from('job_rams')
      .select('id, answers')
      .eq('id', recordId)
      .eq('job_id', jobId)
      .limit(1)

    if (lookupError) {
      console.error(
        'Cannot Start comments lookup error:',
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
            'Workflow record not found',
        },
        { status: 404 }
      )
    }

    const existingAnswers =
      currentRecord.answers &&
      typeof currentRecord.answers === 'object' &&
      !Array.isArray(currentRecord.answers)
        ? currentRecord.answers
        : {}

    const {
      data: updatedRecords,
      error: updateError,
    } = await supabaseAdmin
      .from('job_rams')
      .update({
        answers: {
          ...existingAnswers,
          cannotStartComments: comments,
        },
      })
      .eq('id', recordId)
      .eq('job_id', jobId)
      .select('id, answers')

    if (updateError) {
      console.error(
        'Cannot Start comments update error:',
        updateError
      )

      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    const updatedRecord =
      updatedRecords?.[0] || null

    if (!updatedRecord) {
      return NextResponse.json(
        {
          error:
            'Workflow could not be updated',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      record: updatedRecord,
      nextStep: 'cannot_start_photos',
    })
  } catch (error) {
    console.error(
      'Cannot Start comments error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unexpected error saving comments.',
      },
      { status: 500 }
    )
  }
}