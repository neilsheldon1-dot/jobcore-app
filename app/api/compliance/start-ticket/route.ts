import { NextResponse } from 'next/server'
import { createClient } from '../../../utils/supabase/server'
import { supabaseAdmin } from '../../../../lib/supabaseAdmin'

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

    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in to start this job.' },
        { status: 401 }
      )
    }

    const { data: profile, error: profileError } =
      await supabaseAdmin
        .from('profiles')
        .select('id, display_name, full_name, email')
        .eq('email', user.email)
        .maybeSingle()

    if (profileError) {
      console.error(
        'Ticket operative profile lookup error:',
        profileError
      )

      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    if (!profile) {
      return NextResponse.json(
        {
          error:
            'Your JobCore operative profile could not be found.',
        },
        { status: 404 }
      )
    }

    const operativeName =
      profile.display_name ||
      profile.full_name ||
      profile.email ||
      'Operative'

    const { data: existingRecords, error: existingError } =
      await supabaseAdmin
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
      console.error(
        'Existing Ticket workflow lookup error:',
        existingError
      )

      return NextResponse.json(
        { error: existingError.message },
        { status: 500 }
      )
    }

    const existingRecord = existingRecords?.[0] || null

    if (existingRecord) {
      const { data: repairedRecords, error: repairError } =
        await supabaseAdmin
          .from('job_rams')
          .update({
            operative_id:
              existingRecord.operative_id || profile.id,
            signed_by:
              existingRecord.signed_by || operativeName,
          })
          .eq('id', existingRecord.id)
          .eq('job_id', jobId)
          .select('*')

      if (repairError) {
        console.error(
          'Existing Ticket workflow operative update error:',
          repairError
        )

        return NextResponse.json(
          { error: repairError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        record: repairedRecords?.[0] || existingRecord,
        reused: true,
      })
    }

    const { data: templates, error: templateError } =
      await supabaseAdmin
        .from('rams_templates')
        .select('*')
        .eq('code', 'TICKET')
        .eq('is_active', true)
        .order('version', { ascending: false })
        .limit(1)

    if (templateError) {
      console.error(
        'Ticket template lookup error:',
        templateError
      )

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
      await supabaseAdmin
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
          operative_id: profile.id,
          signed_by: operativeName,
        })
        .select('*')

    if (insertError) {
      console.error(
        'Ticket workflow insert error:',
        insertError
      )

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    const record = insertedRecords?.[0] || null

    if (!record) {
      return NextResponse.json(
        {
          error:
            'Ticket workflow was created but could not be returned',
        },
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