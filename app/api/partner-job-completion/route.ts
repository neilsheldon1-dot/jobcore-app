import { NextResponse } from 'next/server'
import { createClient } from '../../utils/supabase/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      jobId,
      completedBy,
      workCompleted,
    } = body

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required.' },
        { status: 400 }
      )
    }

    if (!completedBy?.trim()) {
      return NextResponse.json(
        { error: 'Completed-by name is required.' },
        { status: 400 }
      )
    }

    if (!workCompleted?.trim()) {
      return NextResponse.json(
        { error: 'Work completed is required.' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      )
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, full_name')
      .eq('id', user.id)
      .maybeSingle()

    const partnerName =
      profile?.display_name ||
      profile?.full_name ||
      'UPVC Outlet'

    const { data: statusRecord, error: statusError } =
      await supabaseAdmin
        .from('job_statuses')
        .select('id, name')
        .eq('name', 'Needs Invoicing')
        .maybeSingle()

    if (statusError || !statusRecord) {
      return NextResponse.json(
        {
          error:
            statusError?.message ||
            'Needs Invoicing status was not found.',
        },
        { status: 500 }
      )
    }

    const {
      data: completion,
      error: completionError,
    } = await supabaseAdmin
      .from('partner_job_completions')
      .upsert(
        {
          job_id: jobId,
          partner_profile_id: user.id,
          partner_name: partnerName,
          completed_by: completedBy.trim(),
          work_completed: workCompleted.trim(),
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'job_id',
        }
      )
      .select('*')
      .single()

    if (completionError) {
      return NextResponse.json(
        { error: completionError.message },
        { status: 500 }
      )
    }

    const { error: jobUpdateError } =
      await supabaseAdmin
        .from('jobs')
        .update({
          status_id: statusRecord.id,

          // Removes the completed job from the partner’s
          // live queue while retaining the completion record.
          assigned_user_id: null,
        })
        .eq('id', jobId)

    if (jobUpdateError) {
      return NextResponse.json(
        { error: jobUpdateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      completion,
      status: statusRecord.name,
    })
  } catch (error) {
    console.error(
      'Partner job completion error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to complete the job.',
      },
      { status: 500 }
    )
  }
}