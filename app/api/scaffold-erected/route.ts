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
    erected_date: today,
  }

  const { error } = existingRecord
    ? await supabase.from('scaffold_records').update(payload).eq('job_id', job_id)
    : await supabase.from('scaffold_records').insert({ job_id, ...payload })

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  const { data: scaffoldBlocker } = await supabase
    .from('blocker_types')
    .select('id')
    .eq('name', 'Scaffold')
    .maybeSingle()

  if (scaffoldBlocker?.id) {
    const { error: blockerError } = await supabase
      .from('job_blocker_links')
      .delete()
      .eq('job_id', job_id)
      .eq('blocker_type_id', scaffoldBlocker.id)

    if (blockerError) {
      return NextResponse.json({ error: blockerError }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}