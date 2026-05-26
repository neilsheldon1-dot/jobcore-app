import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { property_id } = await request.json()

  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id')
    .eq('property_id', property_id)

  if (jobsError) {
    return NextResponse.json({ error: jobsError }, { status: 500 })
  }

  if (jobs && jobs.length > 0) {
    return NextResponse.json(
      { error: 'This property has linked jobs and cannot be deleted.' },
      { status: 400 }
    )
  }

  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', property_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}