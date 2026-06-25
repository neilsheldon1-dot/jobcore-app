import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const { job_id, asbestos_status_id } = await request.json()

  const today = new Date().toISOString().split('T')[0]

  const { data: status } = await supabase
    .from('asbestos_statuses')
    .select('name')
    .eq('id', asbestos_status_id)
    .maybeSingle()

  const { error: jobError } = await supabase
    .from('jobs')
    .update({ asbestos_status_id })
    .eq('id', job_id)

  if (jobError) {
    return NextResponse.json({ error: jobError }, { status: 500 })
  }

  const payload: any = {}

  if (status?.name === 'Request Report') {
    payload.report_requested_date = today
  }

  if (status?.name === 'Arrange Inspection') {
    payload.inspection_date = today
  }

  if (status?.name === 'Request Removal') {
    payload.removal_requested_date = today
  }

  if (status?.name === 'Safe To Work') {
    payload.safe_to_work_date = today
  }

  if (Object.keys(payload).length > 0) {
    const { data: existingRecord } = await supabase
      .from('asbestos_records')
      .select('id')
      .eq('job_id', job_id)
      .maybeSingle()

    const { error: recordError } = existingRecord
      ? await supabase
          .from('asbestos_records')
          .update(payload)
          .eq('job_id', job_id)
      : await supabase
          .from('asbestos_records')
          .insert({ job_id, ...payload })

    if (recordError) {
      return NextResponse.json({ error: recordError }, { status: 500 })
    }
  }

  if (status?.name === 'Safe To Work') {
    const { data: asbestosBlocker } = await supabase
      .from('blocker_types')
      .select('id')
      .eq('name', 'Asbestos')
      .maybeSingle()

    if (asbestosBlocker?.id) {
      const { error: blockerError } = await supabase
        .from('job_blocker_links')
        .delete()
        .eq('job_id', job_id)
        .eq('blocker_type_id', asbestosBlocker.id)

      if (blockerError) {
        return NextResponse.json({ error: blockerError }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ success: true })
}