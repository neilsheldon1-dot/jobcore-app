import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id, scaffold_status_id } = await request.json()

  const { error } = await supabase
    .from('jobs')
    .update({ scaffold_status_id })
    .eq('id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}