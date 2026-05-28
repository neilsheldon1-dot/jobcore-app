import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

function normalizeAddress(value: string) {
  return value
    .toLowerCase()
    .replace(/[\s\-_.,']/g, '')
    .trim()
}

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

  const normalized_address = normalizeAddress(
    `${address_line_1 || ''}${town || ''}${postcode || ''}`
  )

  const { data: existingProperty, error: duplicateCheckError } = await supabase
    .from('properties')
    .select('id, address_line_1, town, postcode')
    .eq('normalized_address', normalized_address)
    .maybeSingle()

  if (duplicateCheckError) {
    return NextResponse.json(
      { error: duplicateCheckError },
      { status: 500 }
    )
  }

  if (existingProperty) {
    return NextResponse.json(
      {
        error: 'Property already exists',
        property: existingProperty,
      },
      { status: 409 }
    )
  }

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
        normalized_address,
      },
    ])
    .select('id')
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Property already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error },
      { status: 500 }
    )
  }

  return NextResponse.json(data)
}