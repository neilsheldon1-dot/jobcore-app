import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const jobIds = body?.job_ids

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        {
          error: 'Please select at least one job.',
        },
        { status: 400 }
      )
    }

    const {
      data: ticketStatus,
      error: statusError,
    } = await supabaseAdmin
      .from('job_statuses')
      .select('id, name')
      .eq('name', 'Ticket')
      .maybeSingle()

    if (statusError || !ticketStatus) {
      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'Ticket status was not found.',
        },
        { status: 500 }
      )
    }

    const {
      data: updatedJobs,
      error: updateError,
    } = await supabaseAdmin
      .from('jobs')
      .update({
        status_id: ticketStatus.id,
        assigned_user_id: null,
      })
      .in('id', jobIds)
      .select('id, status_id, assigned_user_id')

    if (updateError) {
      return NextResponse.json(
        {
          error: updateError.message,
        },
        { status: 500 }
      )
    }

    if (!updatedJobs || updatedJobs.length !== jobIds.length) {
      return NextResponse.json(
        {
          error:
            'Not all selected jobs could be returned to Tickets.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: updatedJobs.length,
    })
  } catch (error) {
    console.error(
      'Bulk return to tickets error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to return selected jobs to Tickets.',
      },
      { status: 500 }
    )
  }
}