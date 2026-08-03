import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const jobIds = body?.job_ids
    const isOnHold = body?.is_on_hold

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'No jobs selected' },
        { status: 400 }
      )
    }

    if (typeof isOnHold !== 'boolean') {
      return NextResponse.json(
        { error: 'A valid On Hold value is required' },
        { status: 400 }
      )
    }

    const { data: updatedJobs, error } =
      await supabaseAdmin
        .from('jobs')
        .update({
          is_on_hold: isOnHold,
        })
        .in('id', jobIds)
        .select('id, is_on_hold')

    if (error) {
      console.error(
        'Bulk On Hold update error:',
        error
      )

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updatedCount: updatedJobs?.length || 0,
    })
  } catch (error) {
    console.error(
      'Bulk On Hold error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unexpected error updating On Hold jobs',
      },
      { status: 500 }
    )
  }
}