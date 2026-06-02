import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id } = await request.json()

  const today = new Date().toISOString().split('T')[0]

  const { data: existingRecord } = await supabase
    .from('scaffold_records')
    .select('*')
    .eq('job_id', job_id)
    .maybeSingle()

  if (existingRecord) {
    const { error } = await supabase
      .from('scaffold_records')
      .update({
        quote_requested_date: today,
      })
      .eq('job_id', job_id)

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  } else {
    const { error } = await supabase
      .from('scaffold_records')
      .insert({
        job_id,
        supplier_name: 'Jamie Seager Scaffolding',
        quote_requested_date: today,
      })

    if (error) {
      return NextResponse.json({ error }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}