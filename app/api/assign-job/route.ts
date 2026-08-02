import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_id, assigned_user_id } = body

  if (!job_id) {
    return NextResponse.json(
      { error: 'No job selected' },
      { status: 400 }
    )
  }

  if (assigned_user_id) {
    const { data: assignee, error: assigneeError } =
      await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', assigned_user_id)
        .maybeSingle()

    if (assigneeError || !assignee) {
      return NextResponse.json(
        {
          error:
            assigneeError?.message ||
            'Selected assignee was not found',
        },
        { status: 400 }
      )
    }
  }

  const { data: updatedJob, error: updateError } =
    await supabaseAdmin
      .from('jobs')
      .update({
        assigned_user_id: assigned_user_id || null,
      })
      .eq('id', job_id)
      .select('id, assigned_user_id')
      .maybeSingle()

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    job: updatedJob,
  })
}