import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      address_line_1,
      address_line_2,
      town,
      postcode,
      client,
      zone,
      tenant_contact,
      description,
      urgent,
      job_number,
po_number,
    } = body

    // 1. Create property
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        address_line_1,
        address_line_2,
        town,
        postcode,
        client,
        zone,
        tenant_contact,
        
      })
      .select()
      .single()

    if (propertyError) {
      return NextResponse.json(propertyError, { status: 500 })
    }

    // 2. Get default Ticket status
    const { data: ticketStatus } = await supabase
      .from('job_statuses')
      .select('*')
      .eq('name', 'Ticket')
      .single()

    // 3. Get default Reactive job type
    const { data: reactiveType } = await supabase
      .from('job_types')
      .select('*')
      .eq('name', 'Reactive')
      .single()

    // 4. Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        property_id: property.id,
        description,
        urgent,
        status_id: ticketStatus?.id,
        job_type_id: reactiveType?.id,
        job_number,
po_number,
      })
      .select()
      .single()

    if (jobError) {
  return NextResponse.json(jobError, { status: 500 })
}

if (reactiveType?.id) {
  const { error: jobTypeLinkError } = await supabase
    .from('job_type_links')
    .insert({
      job_id: job.id,
      job_type_id: reactiveType.id,
    })

  if (jobTypeLinkError && jobTypeLinkError.code !== '23505') {
    return NextResponse.json(jobTypeLinkError, { status: 500 })
  }
}

return NextResponse.json({
  success: true,
  job_id: job.id,
})



  } catch (error) {
    return NextResponse.json(error, { status: 500 })
  }
}