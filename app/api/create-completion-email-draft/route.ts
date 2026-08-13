import { NextResponse } from 'next/server'

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxBKxnyVmbjxNV7-Oo7Z1EnuFlOhi2aGqawdIKeyiqCfDQFFhMqXXdqa15RF_v5ewwv/exec'

function safeFilenamePart(value: string) {
  return value
    .replace(/,/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

function extensionFromMimeType(
  mimeType: string
) {
  if (mimeType.includes('png')) return 'png'
  if (mimeType.includes('webp')) return 'webp'
  if (mimeType.includes('gif')) return 'gif'
  if (mimeType.includes('heic')) return 'heic'

  return 'jpg'
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const document = body.document

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error: 'Completion document is required.',
        },
        { status: 400 }
      )
    }

    const pdfResponse = await fetch(
      new URL(
        '/api/create-completion-pdf',
        request.url
      ),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(document),
      }
    )

    if (!pdfResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to generate the completion PDF.',
        },
        { status: 500 }
      )
    }

    const pdfBuffer = Buffer.from(
      await pdfResponse.arrayBuffer()
    )

    const address =
      document.property?.address ||
      'property'

    const jobNumber =
      document.property?.jobNumber || ''

    const safeAddress =
      safeFilenamePart(address) || 'job'

    const attachments: {
      filename: string
      mimeType: string
      base64: string
    }[] = [
      {
        filename: `completion-report-${safeAddress}.pdf`,
        mimeType: 'application/pdf',
        base64: pdfBuffer.toString('base64'),
      },
    ]

    const groupCounts: Record<string, number> = {}

    for (const photo of document.photos || []) {
      const photoUrl =
        photo.url ||
        photo.file_url ||
        photo.original_file_url

      if (!photoUrl) {
        continue
      }

      const photoResponse = await fetch(photoUrl)

      if (!photoResponse.ok) {
        throw new Error(
          `Unable to fetch one of the report photographs.`
        )
      }

      const mimeType =
        photoResponse.headers.get(
          'content-type'
        ) || 'image/jpeg'

      const photoBuffer = Buffer.from(
        await photoResponse.arrayBuffer()
      )

      const rawGroup =
        photo.photo_group || 'Photo'

      const group =
        safeFilenamePart(rawGroup) ||
        'photo'

      groupCounts[group] =
        (groupCounts[group] || 0) + 1

      const number = String(
        groupCounts[group]
      ).padStart(2, '0')

      const extension =
        extensionFromMimeType(mimeType)

      attachments.push({
        filename: `${group}-${number}.${extension}`,
        mimeType,
        base64: photoBuffer.toString(
          'base64'
        ),
      })
    }

    const subjectParts = [
      'Completion Report',
      jobNumber,
      address,
    ].filter(Boolean)

    const subject = subjectParts.join(
      ' - '
    )

    const message = [
      'Good afternoon,',
      '',
      'Please find attached the completion report and supporting photographs for the above works.',
      '',
      'Kind regards,',
      'Rubber Roofs',
    ].join('\n')

    const response = await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: 'POST',
        body: JSON.stringify({
          to: body.to || [],
          cc: body.cc || [],
          subject,
          message,
          attachments,
        }),
      }
    )

    const text = await response.text()

    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Google Script returned an empty response.',
        },
        { status: 500 }
      )
    }

    const result = JSON.parse(text)

    if (!response.ok || !result.success) {
      return NextResponse.json(
        {
          success: false,
          error:
            result.error ||
            'Failed to create completion email draft.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      attachmentCount:
        attachments.length,
    })
  } catch (error) {
    console.error(
      'Completion email draft error:',
      error
    )

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create completion email draft.',
      },
      { status: 500 }
    )
  }
}