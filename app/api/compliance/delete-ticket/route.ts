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
      .select('id')
      .eq('job_id', jobId)
      .eq('template_code', 'TICKET')

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

    return NextResponse.json({
      success: true,
      deletedCount,
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