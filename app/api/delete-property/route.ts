import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()
  const { property_id } = body

  const { data: jobs, error: jobsFetchError } = await supabase
    .from('jobs')
    .select('id')
    .eq('property_id', property_id)

  if (jobsFetchError) {
    return NextResponse.json({ error: jobsFetchError }, { status: 500 })
  }

  const jobIds = jobs?.map((job) => job.id) || []

  if (jobIds.length > 0) {
    const { error: photosDeleteError } = await supabase
      .from('photos')
      .delete()
      .in('job_id', jobIds)

    if (photosDeleteError) {
      return NextResponse.json({ error: photosDeleteError }, { status: 500 })
    }

const { error: notesDeleteError } = await supabase
  .from('job_notes')
  .delete()
  .in('job_id', jobIds)

if (notesDeleteError) {
  return NextResponse.json({ error: notesDeleteError }, { status: 500 })
}

const { error: scaffoldingDeleteError } = await supabase
  .from('scaffolding')
  .delete()
  .in('job_id', jobIds)

if (scaffoldingDeleteError) {
  return NextResponse.json({ error: scaffoldingDeleteError }, { status: 500 })
}

const { error: blockersDeleteError } = await supabase
  .from('job_blockers')
  .delete()
  .in('job_id', jobIds)

if (blockersDeleteError) {
  return NextResponse.json({ error: blockersDeleteError }, { status: 500 })
}

    const { error: jobsDeleteError } = await supabase
      .from('jobs')
      .delete()
      .in('id', jobIds)

    if (jobsDeleteError) {
      return NextResponse.json({ error: jobsDeleteError }, { status: 500 })
    }
  }

  const { error: propertyDeleteError } = await supabase
    .from('properties')
    .delete()
    .eq('id', property_id)

  if (propertyDeleteError) {
    return NextResponse.json({ error: propertyDeleteError }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}