import { NextResponse } from 'next/server'
import { createClient } from '../../utils/supabase/server'

export async function POST(req: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const body = await req.json()
  const { note_id } = body

  const { error } = await supabase
    .from('job_notes')
    .delete()
    .eq('id', note_id)

  if (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}