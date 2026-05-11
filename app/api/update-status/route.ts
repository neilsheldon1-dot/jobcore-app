import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_id, status } = body

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
    .eq('id', job_id)
    .select('id, status_id')

  if (updateError) {
    return NextResponse.json(
      { error: updateError },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    received_job_id: job_id,
    updated_to: statusRecord.name,
    status_id: statusRecord.id,
    updated_rows: updatedRows,
  })
}