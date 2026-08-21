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

  const parsedJobTypeId = Number(job_type_id)

  const { data, error } = await supabase
    .from('jobs')
    .insert([
      {
        property_id,
        description,
        job_type_id: parsedJobTypeId,
        urgent,
        job_number,
        po_number,
        status_id: Number(status_id || 1),
      },
    ])
    .select('id')
    .single()

  if (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    )
  }

  if (parsedJobTypeId) {
    const { error: jobTypeLinkError } =
      await supabase
        .from('job_type_links')
        .insert([
          {
            job_id: data.id,
            job_type_id: parsedJobTypeId,
          },
        ])

    if (jobTypeLinkError) {
      return NextResponse.json(
        { error: jobTypeLinkError },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(data)
}