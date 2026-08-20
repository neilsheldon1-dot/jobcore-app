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
      signatureDataUrl,
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

    if (
      !signatureDataUrl ||
      typeof signatureDataUrl !== 'string'
    ) {
      return NextResponse.json(
        { error: 'A signature is required.' },
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

    const { data: profile } =
      await supabaseAdmin
        .from('profiles')
        .select(
          'display_name, full_name'
        )
        .eq('id', user.id)
        .maybeSingle()

    const partnerName =
      profile?.display_name ||
      profile?.full_name ||
      'UPVC Outlet'

    const {
      data: statusRecord,
      error: statusError,
    } = await supabaseAdmin
      .from('job_statuses')
      .select('id, name')
      .eq('name', 'Needs Invoicing')
      .maybeSingle()

    if (
      statusError ||
      !statusRecord
    ) {
      console.error(
        'Needs Invoicing status lookup failed:',
        statusError
      )

      return NextResponse.json(
        {
          error:
            'Unable to finish submitting this job.',
        },
        { status: 500 }
      )
    }

    const {
      data: completion,
      error: completionError,
    } = await supabaseAdmin
      .from(
        'partner_job_completions'
      )
      .upsert(
        {
          job_id: jobId,
          partner_profile_id:
            user.id,
          partner_name:
            partnerName,
          completed_by:
            completedBy.trim(),
          work_completed:
            workCompleted.trim(),
          signature_data_url:
            signatureDataUrl,
          completed_at:
            new Date().toISOString(),
        },
        {
          onConflict: 'job_id',
        }
      )
      .select('*')
      .single()

    if (completionError) {
      console.error(
        'Partner completion save failed:',
        completionError
      )

      return NextResponse.json(
        {
          error:
            'Unable to finish submitting this job.',
        },
        { status: 500 }
      )
    }

    const {
      data: updatedJob,
      error: jobUpdateError,
    } = await supabaseAdmin
      .from('jobs')
      .update({
        status_id:
          statusRecord.id,
        assigned_user_id: null,
      })
      .eq('id', jobId)
      .select(
        'id, status_id, assigned_user_id'
      )
      .single()

    if (
      jobUpdateError ||
      !updatedJob
    ) {
      console.error(
        'Partner job handover failed:',
        jobUpdateError
      )

      return NextResponse.json(
        {
          error:
            'Unable to finish submitting this job. Please try again or contact the office.',
        },
        { status: 500 }
      )
    }

    if (
      updatedJob.status_id !==
        statusRecord.id ||
      updatedJob.assigned_user_id !==
        null
    ) {
      console.error(
        'Partner job handover verification failed:',
        updatedJob
      )

      return NextResponse.json(
        {
          error:
            'Unable to finish submitting this job. Please try again or contact the office.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      completion,
    })
  } catch (error) {
    console.error(
      'Partner job completion error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unable to finish submitting this job. Please try again or contact the office.',
      },
      { status: 500 }
    )
  }
}