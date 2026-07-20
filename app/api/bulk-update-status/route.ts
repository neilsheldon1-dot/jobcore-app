import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_ids, status } = body

  if (!Array.isArray(job_ids) || job_ids.length === 0) {
    return NextResponse.json(
      { error: 'No jobs selected' },
      { status: 400 }
    )
  }

  if (!status) {
    return NextResponse.json(
      { error: 'No status selected' },
      { status: 400 }
    )
  }

  const { data: statusRecord, error: statusError } = await supabase
    .from('job_statuses')
    .select('id, name')
    .eq('name', status)
    .maybeSingle()

  if (statusError || !statusRecord) {
    return NextResponse.json(
      {
        error: statusError || `Status not found: ${status}`,
        received_status: status,
      },
      { status: 500 }
    )
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from('jobs')
    .update({
      status_id: statusRecord.id,
    })
    .in('id', job_ids)
    .select('id, status_id')

  if (updateError) {
    return NextResponse.json(
      { error: updateError },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    updated_count: updatedRows?.length || 0,
    updated_to: statusRecord.name,
    status_id: statusRecord.id,
    updated_rows: updatedRows,
  })
}