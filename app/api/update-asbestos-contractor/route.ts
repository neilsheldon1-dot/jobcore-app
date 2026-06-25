import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id, contractor_name } = await request.json()

  const { data: existingRecord } = await supabase
    .from('asbestos_records')
    .select('id')
    .eq('job_id', job_id)
    .maybeSingle()

  const { error } = existingRecord
    ? await supabase
        .from('asbestos_records')
        .update({ contractor_name })
        .eq('job_id', job_id)
    : await supabase
        .from('asbestos_records')
        .insert({ job_id, contractor_name })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}