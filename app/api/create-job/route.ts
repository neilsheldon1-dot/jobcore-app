import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    property_id,
    description,
    job_type_id,
    status_id,
    urgent,
    job_number,
    po_number,
  } = body

  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        property_id,
        description,
        job_type_id: Number(job_type_id),
        urgent,
        job_number,
        po_number,
        status_id: Number(status_id || 1),
      },
    ])
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json(data)
}