import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id } = await request.json()

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('scaffold_records')
    .update({
      erection_requested_date: today,
    })
    .eq('job_id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}