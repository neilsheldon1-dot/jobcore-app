import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const jobId = body?.jobId
    const partnerProfileId = body?.partnerProfileId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'Job ID is required.' },
        { status: 400 }
      )
    }

    if (
      !partnerProfileId ||
      typeof partnerProfileId !== 'string'
    ) {
      return NextResponse.json(
        { error: 'Partner profile is required.' },
        { status: 400 }
      )
    }

    const {
      data: allocatedStatus,
      error: statusError,
    } = await supabaseAdmin
      .from('job_statuses')
      .select('id, name')
      .eq('name', 'Allocated')
      .maybeSingle()

    if (statusError || !allocatedStatus) {
      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'Allocated status was not found.',
        },
        { status: 500 }
      )
    }

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from('partner_job_completions')
      .delete()
      .eq('job_id', jobId)

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    const {
      data: updatedJob,
      error: updateError,
    } = await supabaseAdmin
      .from('jobs')
      .update({
        status_id: allocatedStatus.id,
        assigned_user_id: partnerProfileId,
      })
      .eq('id', jobId)
      .select('id, status_id, assigned_user_id')
      .single()

    if (updateError || !updatedJob) {
      return NextResponse.json(
        {
          error:
            updateError?.message ||
            'The partner report was deleted but the job could not be reset.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      job: updatedJob,
    })
  } catch (error) {
    console.error(
      'Delete partner completion error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to delete partner completion.',
      },
      { status: 500 }
    )
  }
}