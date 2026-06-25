import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

const allowedFields = [
  'report_requested_date',
  'inspection_date',
  'removal_requested_date',
  'safe_to_work_date',
]

function getNextStatusName(record: any) {
  if (record.safe_to_work_date) return 'Safe To Work'
  if (record.removal_requested_date) return 'Request Removal'
  if (record.inspection_date) return 'Arrange Inspection'
  if (record.report_requested_date) return 'Request Report'
  return null
}

export async function POST(request: Request) {
  const { job_id, field } = await request.json()

  if (!allowedFields.includes(field)) {
    return NextResponse.json(
      { error: 'Invalid field' },
      { status: 400 }
    )
  }

  const { error: updateError } = await supabase
    .from('asbestos_records')
    .update({ [field]: null })
    .eq('job_id', job_id)

  if (updateError) {
    return NextResponse.json({ error: updateError }, { status: 500 })
  }

  const { data: record, error: recordError } = await supabase
    .from('asbestos_records')
    .select('*')
    .eq('job_id', job_id)
    .maybeSingle()

  if (recordError) {
    return NextResponse.json({ error: recordError }, { status: 500 })
  }

  const nextStatusName = getNextStatusName(record)

  if (!nextStatusName) {
    const { error: jobClearError } = await supabase
      .from('jobs')
      .update({ asbestos_status_id: null })
      .eq('id', job_id)

    if (jobClearError) {
      return NextResponse.json({ error: jobClearError }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  }

  const { data: status, error: statusError } = await supabase
    .from('asbestos_statuses')
    .select('id')
    .eq('name', nextStatusName)
    .maybeSingle()

  if (statusError) {
    return NextResponse.json({ error: statusError }, { status: 500 })
  }

  const { error: jobUpdateError } = await supabase
    .from('jobs')
    .update({ asbestos_status_id: status?.id || null })
    .eq('id', job_id)

  if (jobUpdateError) {
    return NextResponse.json({ error: jobUpdateError }, { status: 500 })
  }

if (field === 'safe_to_work_date') {
  const { data: asbestosBlocker } = await supabase
    .from('blocker_types')
    .select('id')
    .eq('name', 'Asbestos')
    .maybeSingle()

  if (asbestosBlocker?.id) {
    const { data: existingLink } = await supabase
      .from('job_blocker_links')
      .select('id')
      .eq('job_id', job_id)
      .eq('blocker_type_id', asbestosBlocker.id)
      .maybeSingle()

    if (!existingLink) {
      await supabase
        .from('job_blocker_links')
        .insert({
          job_id,
          blocker_type_id: asbestosBlocker.id,
        })
    }
  }
}

  return NextResponse.json({ success: true })
}