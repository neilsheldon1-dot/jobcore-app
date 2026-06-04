import { NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabase'

function normalise(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim()
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const address = searchParams.get('address') || ''

  if (!address) {
    return NextResponse.json({ exists: false })
  }

  const { data, error } = await supabase
    .from('properties')
    .select('id, address_line_1, town, postcode')
    .limit(500)

  if (error) {
    return NextResponse.json({ exists: false })
  }

  const normalisedAddress = normalise(address)

  const match = data?.find((property) =>
    normalise(property.address_line_1 || '').includes(normalisedAddress)
  )

  return NextResponse.json({
    exists: !!match,
    property: match || null,
  })
}