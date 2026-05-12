import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  const { job_id, urgent } = body

  const { error } = await supabase
    .from('jobs')
    .update({ urgent })
    .eq('id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}