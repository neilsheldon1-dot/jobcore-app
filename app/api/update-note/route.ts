import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { note_id, content } = await request.json()

  const { error } = await supabase
    .from('job_notes')
    .update({ content })
    .eq('id', note_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}