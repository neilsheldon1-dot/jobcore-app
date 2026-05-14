import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

export async function POST(request: Request) {
  const body = await request.json()

  const {
    id,
    address_line_1,
    address_line_2,
    town,
    postcode,
    client,
    zone,
    tenant_contact,
  } = body

  const { error } = await supabase
    .from('properties')
    .update({
      address_line_1,
      address_line_2,
      town,
      postcode,
      client,
      zone,
      tenant_contact,
    })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}