import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const { job_id, job_type_id, active } = body

  if (active) {
    const { error } = await supabase
      .from('job_type_links')
      .insert([{ job_id, job_type_id }])

    if (error && error.code !== '23505') {
      return NextResponse.json({ error }, { status: 500 })
    }

    await supabase
      .from('jobs')
      .update({ job_type_id })
      .eq('id', job_id)
  } else {
    const { error } = await supabase
      .from('job_type_links')
      .delete()
      .eq('job_id', job_id)
      .eq('job_type_id', job_type_id)

      const { data: remainingTypes } = await supabase
  .from('job_type_links')
  .select('job_type_id')
  .eq('job_id', job_id)
  .limit(1)

await supabase
  .from('jobs')
  .update({
    job_type_id: remainingTypes && remainingTypes.length > 0
      ? remainingTypes[0].job_type_id
      : null,
  })
  .eq('id', job_id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}