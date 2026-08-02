import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

export async function DELETE(request: Request) {
  try {
    const body = await request.json()

    const jobId = body?.jobId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'A valid job ID is required.' },
        { status: 400 }
      )
    }

    const {
      data: existingRecords,
      error: lookupError,
    } = await supabaseAdmin
      .from('job_rams')
      .select('id, operative_id, created_at')
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')
      .order('created_at', { ascending: false })

    if (lookupError) {
      console.error(
        'Ticket workflow lookup error:',
        lookupError
      )

      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    if (!existingRecords || existingRecords.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
      })
    }

    const latestRecord = existingRecords[0]
    const operativeId = latestRecord?.operative_id || null

    const {
      data: deletedRecords,
      error: deleteError,
    } = await supabaseAdmin
      .from('job_rams')
      .delete()
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')
      .select('id')

    if (deleteError) {
      console.error(
        'Ticket workflow delete error:',
        deleteError
      )

      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    const deletedCount = deletedRecords?.length ?? 0

    if (deletedCount === 0) {
      return NextResponse.json(
        {
          error:
            'The Ticket Workflow record was found but was not deleted.',
        },
        { status: 500 }
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
      console.error(
        'Allocated status lookup error:',
        statusError
      )

      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'The workflow was deleted, but the Allocated status could not be found.',
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
        status_id: allocatedStatus.id,
        assigned_user_id: operativeId,
      })
      .eq('id', jobId)
      .select('id, status_id, assigned_user_id')

    if (jobUpdateError) {
      console.error(
        'Ticket workflow reset error:',
        jobUpdateError
      )

      return NextResponse.json(
        {
          error:
            'The workflow was deleted, but the job could not be returned to Allocated.',
        },
        { status: 500 }
      )
    }

    const updatedJob = updatedJobs?.[0] || null

    if (!updatedJob) {
      return NextResponse.json(
        {
          error:
            'The workflow was deleted, but the job reset could not be confirmed.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      deletedCount,
      job: updatedJob,
    })
  } catch (error) {
    console.error(
      'Delete Ticket workflow error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error deleting the Ticket workflow.',
      },
      { status: 500 }
    )
  }
}