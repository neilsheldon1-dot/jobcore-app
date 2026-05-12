import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_id, job_type } = body

  const { data: jobTypeRecord, error: jobTypeError } = await supabase
    .from('job_types')
    .select('id, name')
    .eq('name', job_type)
    .maybeSingle()

  if (jobTypeError || !jobTypeRecord) {
    return NextResponse.json(
      {
        error: jobTypeError || `Job type not found: ${job_type}`,
        received_job_type: job_type,
      },
      { status: 500 }
    )
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from('jobs')
    .update({
      job_type_id: jobTypeRecord.id,
    })
    .eq('id', job_id)
    .select('id, job_type_id')

  if (updateError) {
    return NextResponse.json(
      { error: updateError },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    received_job_id: job_id,
    updated_to: jobTypeRecord.name,
    job_type_id: jobTypeRecord.id,
    updated_rows: updatedRows,
  })
}