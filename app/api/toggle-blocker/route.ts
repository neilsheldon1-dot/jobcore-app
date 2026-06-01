import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    job_id,
    blocker_type_id,
    active,
  } = body

  const { data: blockerType, error: blockerTypeError } = await supabase
    .from('blocker_types')
    .select('name')
    .eq('id', blocker_type_id)
    .maybeSingle()

  if (blockerTypeError) {
    return NextResponse.json({ error: blockerTypeError }, { status: 500 })
  }

  if (active) {
    const { error } = await supabase
      .from('job_blocker_links')
      .insert([
        {
          job_id,
          blocker_type_id,
        },
      ])

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('job_blocker_links')
      .delete()
      .eq('job_id', job_id)
      .eq('blocker_type_id', blocker_type_id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }

    if (blockerType?.name?.toLowerCase() === 'scaffold') {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ scaffold_status_id: null })
        .eq('id', job_id)

      if (updateError) {
        return NextResponse.json({ error: updateError }, { status: 500 })
      }
    }

    if (blockerType?.name?.toLowerCase() === 'asbestos') {
      const { error: updateError } = await supabase
        .from('jobs')
        .update({ asbestos_status_id: null })
        .eq('id', job_id)

      if (updateError) {
        return NextResponse.json({ error: updateError }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}