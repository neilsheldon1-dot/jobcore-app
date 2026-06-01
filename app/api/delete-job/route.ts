import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id } = await request.json()

  await supabase.from('job_blocker_links').delete().eq('job_id', job_id)
  await supabase.from('job_type_links').delete().eq('job_id', job_id)
  await supabase.from('job_notes').delete().eq('job_id', job_id)
  await supabase.from('photos').delete().eq('job_id', job_id)

  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}