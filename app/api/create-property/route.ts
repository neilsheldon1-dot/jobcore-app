import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    address_line_1,
    address_line_2,
    town,
    postcode,
    client,
    zone,
    tenant_contact,
    notes,
  } = body

  const { data, error } = await supabase
    .from('properties')
    .insert([
      {
        address_line_1,
        address_line_2,
        town,
        postcode,
        client,
        zone,
        tenant_contact,
        notes,
      },
    ])
    .select('id')
    .single()

  if (error) {
    return NextResponse.json(
      { error },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}