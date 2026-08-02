import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()

  const jobId =
    typeof body.jobId === 'string' ? body.jobId : ''

  const recordId =
    typeof body.recordId === 'string'
      ? body.recordId
      : ''

  const photoIds = Array.isArray(body.photoIds)
    ? body.photoIds.filter(
        (photoId: unknown): photoId is string =>
          typeof photoId === 'string' &&
          photoId.trim().length > 0
      )
    : []

  if (!jobId || !recordId) {
    return NextResponse.json(
      {
        error: 'Job ID and workflow record ID are required',
      },
      { status: 400 }
    )
  }

  if (photoIds.length === 0) {
    return NextResponse.json(
      {
        error: 'At least one photo ID is required',
      },
      { status: 400 }
    )
  }

  const { data: record, error: recordError } =
    await supabaseAdmin
      .from('job_rams')
      .select('id, answers')
      .eq('id', recordId)
      .eq('job_id', jobId)
      .maybeSingle()

  if (recordError) {
    return NextResponse.json(
      { error: recordError.message },
      { status: 500 }
    )
  }

  if (!record) {
    return NextResponse.json(
      { error: 'Ticket workflow record not found' },
      { status: 404 }
    )
  }

  const existingAnswers =
    record.answers &&
    typeof record.answers === 'object' &&
    !Array.isArray(record.answers)
      ? record.answers
      : {}

  const existingPhotoIds = Array.isArray(
    existingAnswers.cannotStartPhotoIds
  )
    ? existingAnswers.cannotStartPhotoIds.filter(
        (photoId: unknown): photoId is string =>
          typeof photoId === 'string'
      )
    : []

  const combinedPhotoIds = Array.from(
    new Set([...existingPhotoIds, ...photoIds])
  )

  const updatedAnswers = {
    ...existingAnswers,
    cannotStartPhotoIds: combinedPhotoIds,
    cannotStartPhotosUpdatedAt:
      new Date().toISOString(),
  }

  const { error: updateError } = await supabaseAdmin
    .from('job_rams')
    .update({
      answers: updatedAnswers,
    })
    .eq('id', recordId)
    .eq('job_id', jobId)

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    photoIds: combinedPhotoIds,
  })
}