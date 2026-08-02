import { supabaseAdmin } from '../../../lib/supabaseAdmin'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_ids, assigned_user_id } = body

  if (!Array.isArray(job_ids) || job_ids.length === 0) {
    return NextResponse.json(
      { error: 'No jobs selected' },
      { status: 400 }
    )
  }

  if (!assigned_user_id) {
    return NextResponse.json(
      { error: 'No assignee selected' },
      { status: 400 }
    )
  }

  const { data: assignee, error: assigneeError } =
    await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email')
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

  const { data: allocatedStatus, error: statusError } =
    await supabaseAdmin
      .from('job_statuses')
      .select('id, name')
      .eq('name', 'Allocated')
      .maybeSingle()

  if (statusError || !allocatedStatus) {
    return NextResponse.json(
      {
        error:
          statusError?.message ||
          'Allocated status was not found',
      },
      { status: 500 }
    )
  }

  const { data: updatedRows, error: updateError } =
    await supabaseAdmin
      .from('jobs')
      .update({
        assigned_user_id,
        status_id: allocatedStatus.id,
      })
      .in('id', job_ids)
      .select('id, assigned_user_id, status_id')

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    updated_count: updatedRows?.length || 0,
    assigned_to:
      assignee.full_name ||
      assignee.email ||
      assignee.id,
    updated_rows: updatedRows,
  })
}