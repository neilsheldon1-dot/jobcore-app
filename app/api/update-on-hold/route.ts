import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const jobId = body.job_id
    const isOnHold = body.is_on_hold

    if (!jobId || typeof isOnHold !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          error: 'job_id and is_on_hold are required',
        },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('jobs')
      .update({
        is_on_hold: isOnHold,
      })
      .eq('id', jobId)

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to update job',
      },
      { status: 500 }
    )
  }
}