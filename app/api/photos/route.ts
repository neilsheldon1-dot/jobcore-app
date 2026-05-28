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

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  const body = await req.json()

  const {
    job_id,
    file_url,
    original_file_url,
    category,
  } = body

  const { data, error } = await supabase
    .from('photos')
    .insert([
      {
        job_id,
        file_url,
        original_file_url,
        category,
        uploaded_by: profile?.full_name || user.email,
        watermark_applied: false,
      },
    ])
    .select()

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ data })
}