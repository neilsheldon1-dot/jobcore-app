import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const jobId = body?.jobId

    if (!jobId || typeof jobId !== 'string') {
      return NextResponse.json(
        { error: 'A valid job ID is required' },
        { status: 400 }
      )
    }

    // Look for the newest existing Ticket workflow.
    // Return an array rather than coercing the result into one object.
    const { data: existingRecords, error: existingError } =
      await supabase
        .from('job_rams')
        .select('*')
        .eq('job_id', jobId)
        .eq('template_code', 'TICKET')
        .in('status', [
          'draft',
          'in_progress',
          'accepted',
          'not_started',
          'started_not_completed',
        ])
        .order('created_at', { ascending: false })
        .limit(1)

    if (existingError) {
      console.error('Existing Ticket workflow lookup error:', existingError)

      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      )
    }

    const existingRecord = existingRecords?.[0] || null

    if (existingRecord) {
      return NextResponse.json({
        record: existingRecord,
        reused: true,
      })
    }

    // Load the latest active Ticket template.
    const { data: templates, error: templateError } =
      await supabase
        .from('rams_templates')
        .select('*')
        .eq('code', 'TICKET')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)

    if (templateError) {
      console.error('Ticket template lookup error:', templateError)

      return NextResponse.json(
        { error: templateError.message },
        { status: 500 }
      )
    }

    const template = templates?.[0] || null

    if (!template) {
      return NextResponse.json(
        { error: 'Active Ticket template not found' },
        { status: 404 }
      )
    }

    const now = new Date().toISOString()

    const { data: insertedRecords, error: insertError } =
      await supabase
        .from('job_rams')
        .insert({
          job_id: jobId,
          rams_template_id: template.id,
          status: 'in_progress',
          template_name: template.name,
          template_code: template.code,
          template_version: template.version,
          template_snapshot: template.definition,
          answers: {},
          started_at: now,
        })
        .select('*')

    if (insertError) {
      console.error('Ticket workflow insert error:', insertError)

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    const record = insertedRecords?.[0] || null

    if (!record) {
      return NextResponse.json(
        { error: 'Ticket workflow was created but could not be returned' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      record,
      reused: false,
    })
  } catch (error) {
    console.error('Start Ticket workflow error:', error)

    return NextResponse.json(
      { error: 'Unexpected error starting Ticket workflow' },
      { status: 500 }
    )
  }
}