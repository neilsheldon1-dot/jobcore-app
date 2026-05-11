import { supabase } from '../../../lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

const { job_id, content, created_by } = body

  const { data, error } = await supabase
    .from('job_notes')
    .insert([
      {
        job_id,
        content,
        note_type: 'General',
        created_by,
      },
    ])
    .select()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ data })
}