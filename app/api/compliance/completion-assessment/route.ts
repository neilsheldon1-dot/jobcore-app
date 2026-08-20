import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

type CompletionAssessmentBody = {
  jobId?: unknown
  recordId?: unknown
  canComplete?: unknown
  reasons?: unknown
  comments?: unknown
}

function cleanReasons(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return Array.from(
    new Set(
      value
        .filter(
          (item): item is string =>
            typeof item === 'string'
        )
        .map((item) => item.trim())
        .filter(Boolean)
    )
  )
}

export async function PATCH(request: Request) {
  try {
    const body =
      (await request.json()) as CompletionAssessmentBody

    const jobId =
      typeof body.jobId === 'string'
        ? body.jobId.trim()
        : ''

    const recordId =
      typeof body.recordId === 'string'
        ? body.recordId.trim()
        : ''

    const canComplete = body.canComplete

    const reasons = cleanReasons(body.reasons)

    const comments =
      typeof body.comments === 'string'
        ? body.comments.trim()
        : ''

    if (!jobId) {
      return NextResponse.json(
        { error: 'A valid job ID is required.' },
        { status: 400 }
      )
    }

    if (!recordId) {
      return NextResponse.json(
        {
          error:
            'A valid workflow record ID is required.',
        },
        { status: 400 }
      )
    }

    if (typeof canComplete !== 'boolean') {
      return NextResponse.json(
        {
          error:
            'Please confirm whether all planned work can be completed.',
        },
        { status: 400 }
      )
    }

    if (
      !canComplete &&
      reasons.length === 0 &&
      !comments
    ) {
      return NextResponse.json(
        {
          error:
            'Please tell the office why all planned work cannot be completed.',
        },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user?.email) {
      return NextResponse.json(
        {
          error:
            'You must be signed in to assess this job.',
        },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', user.email)
        .maybeSingle()

    if (profileError) {
      console.error(
        'Completion assessment profile lookup error:',
        profileError
      )

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            'Your JobCore operative profile could not be found.',
        },
        { status: 404 }
      )
    }

    const { data: job, error: jobError } =
      await supabaseAdmin
        .from('jobs')
        .select('id, assigned_user_id')
        .eq('id', jobId)
        .maybeSingle()

    if (jobError) {
      console.error(
        'Completion assessment job lookup error:',
        jobError
      )

      return NextResponse.json(
        { error: jobError.message },
        { status: 500 }
      )
    }

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found.' },
        { status: 404 }
      )
    }

    if (
      job.assigned_user_id &&
      job.assigned_user_id !== profile.id
    ) {
      return NextResponse.json(
        {
          error:
            'This job is assigned to another operative.',
        },
        { status: 403 }
      )
    }

    const {
      data: workflowRecord,
      error: workflowError,
    } = await supabaseAdmin
      .from('job_rams')
      .select('id, job_id, operative_id')
      .eq('id', recordId)
      .eq('job_id', jobId)
      .maybeSingle()

    if (workflowError) {
      console.error(
        'Completion assessment workflow lookup error:',
        workflowError
      )

      return NextResponse.json(
        { error: workflowError.message },
        { status: 500 }
      )
    }

    if (!workflowRecord) {
      return NextResponse.json(
        {
          error:
            'Ticket workflow record was not found.',
        },
        { status: 404 }
      )
    }

    if (
      workflowRecord.operative_id &&
      workflowRecord.operative_id !== profile.id
    ) {
      return NextResponse.json(
        {
          error:
            'This Ticket workflow belongs to another operative.',
        },
        { status: 403 }
      )
    }

    const { data, error: assessmentError } =
      await supabaseAdmin.rpc(
        'record_job_completion_assessment',
        {
          p_job_id: jobId,
          p_workflow_record_id: recordId,
          p_actor_user_id: profile.id,
          p_can_complete: canComplete,
          p_reasons: reasons,
          p_comments: comments,
        }
      )

    if (assessmentError) {
      console.error(
        'Completion assessment Kernel error:',
        assessmentError
      )

      return NextResponse.json(
        { error: assessmentError.message },
        { status: 500 }
      )
    }

    if (!canComplete) {
      const reasonText =
        reasons.length > 0
          ? reasons
              .map((reason) =>
                reason
                  .replace(/[_-]+/g, ' ')
                  .replace(
                    /\b\w/g,
                    (character) =>
                      character.toUpperCase()
                  )
              )
              .join(', ')
          : ''

      const noteParts = [
        comments,
        reasonText
          ? `Reason: ${reasonText}`
          : '',
      ].filter(Boolean)

      const sharedNote = noteParts.join('\n')

      if (sharedNote) {
        const { error: noteError } =
          await supabaseAdmin
            .from('job_notes')
            .insert([
              {
                job_id: jobId,
                content: sharedNote,
                note_type: 'General',
                internal_only: false,
                created_by:
                  profile.full_name ||
                  profile.email ||
                  user.email,
              },
            ])

        if (noteError) {
          console.error(
            'Could not create shared site information note:',
            noteError
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      assessment: data,
      nextStep: canComplete
        ? 'rams_acceptance'
        : 'completion_limitation_recorded',
    })
  } catch (error) {
    console.error(
      'Completion assessment route error:',
      error
    )

    return NextResponse.json(
      {
        error:
          'Unexpected error saving the completion assessment.',
      },
      { status: 500 }
    )
  }
}