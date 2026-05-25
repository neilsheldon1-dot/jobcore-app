import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    job_id,
    blocker_type_id,
    active,
  } = body

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
  }

  return NextResponse.json({ success: true })
}