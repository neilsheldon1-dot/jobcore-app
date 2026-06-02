import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id, field } = await request.json()

  const { error } = await supabase
    .from('scaffold_records')
    .update({
      [field]: null,
    })
    .eq('job_id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}