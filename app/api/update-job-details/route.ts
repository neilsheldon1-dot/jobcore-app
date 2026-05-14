import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    job_id,
    job_number,
    po_number,
    quote_number,
    description,
  } = body

  const { error } = await supabase
    .from('jobs')
    .update({
      job_number,
      po_number,
      quote_number,
      description,
    })
    .eq('id', job_id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}