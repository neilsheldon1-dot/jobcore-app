import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id } = await request.json()
  const today = new Date().toISOString().split('T')[0]

  const { data: existingRecord } = await supabase
    .from('scaffold_records')
    .select('id')
    .eq('job_id', job_id)
    .maybeSingle()

  const payload = {
    supplier_name: 'Jamie Seager Scaffolding',
    dismantle_requested_date: today,
  }

  const { error } = existingRecord
    ? await supabase.from('scaffold_records').update(payload).eq('job_id', job_id)
    : await supabase.from('scaffold_records').insert({ job_id, ...payload })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}