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
  const { job_id, summary } = body

  const { data, error } = await supabase
    .from('completion_reports')
    .upsert(
      {
        job_id,
        summary,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'job_id',
      }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    )
  }

  return NextResponse.json({ data })
}