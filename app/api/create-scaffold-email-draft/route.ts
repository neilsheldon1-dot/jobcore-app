import { NextResponse } from 'next/server'

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxTmy_VTM0IcLNkHNf3sjsq84IWdNNLlf51qmjx00MvabN4MewvP23I2hCFHNzqkR3C/exec'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    const text = await response.text()

    console.log('GOOGLE SCRIPT STATUS:', response.status)
    console.log('GOOGLE SCRIPT RESPONSE:', text)

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: 'Google Script returned an empty response',
          status: response.status,
        },
        { status: 500 }
      )
    }

    const result = JSON.parse(text)

    if (!response.ok || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create Gmail draft',
          status: response.status,
          raw: text,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      raw: text,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    )
  }
}