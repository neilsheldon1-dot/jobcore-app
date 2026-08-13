import { NextResponse } from 'next/server'
import sharp from 'sharp'

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbxBKxnyVmbjxNV7-Oo7Z1EnuFlOhi2aGqawdIKeyiqCfDQFFhMqXXdqa15RF_v5ewwv/exec'

function safeFilenamePart(value: string) {
  return value
    .replace(/,/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
}

async function optimisePhoto(
  photo: any,
  index: number
) {
  const photoUrl =
    photo.url ||
    photo.file_url ||
    photo.original_file_url

  if (!photoUrl) {
    return null
  }

  const response = await fetch(photoUrl)

  if (!response.ok) {
    throw new Error(
      'Unable to fetch one of the report photographs.'
    )
  }

  const originalBuffer = Buffer.from(
    await response.arrayBuffer()
  )

  const optimisedBuffer = await sharp(
    originalBuffer,
    {
      failOn: 'none',
    }
  )
    .rotate()
    .resize({
      width: 1800,
      height: 1800,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .jpeg({
      quality: 78,
      mozjpeg: true,
    })
    .toBuffer()

  const rawGroup =
    photo.photo_group || 'Photo'

  const group =
    safeFilenamePart(rawGroup) ||
    'photo'

  const number = String(
    index + 1
  ).padStart(2, '0')

  return {
    filename: `${group}-${number}.jpg`,
    mimeType: 'image/jpeg',
    base64:
      optimisedBuffer.toString('base64'),
    byteSize: optimisedBuffer.length,
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const document = body.document

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Completion document is required.',
        },
        { status: 400 }
      )
    }

    const cookie =
      request.headers.get('cookie') || ''

    const pdfUrl = new URL(
      '/api/create-completion-pdf',
      request.url
    )

    const pdfResponse = await fetch(
      pdfUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
          Cookie: cookie,
        },
        body:
          JSON.stringify(document),
        cache: 'no-store',
      }
    )

    if (!pdfResponse.ok) {
      const pdfErrorText =
        await pdfResponse.text()

      console.error(
        'Completion PDF generation failed:',
        pdfResponse.status,
        pdfErrorText
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Unable to generate the completion PDF.',
        },
        { status: 500 }
      )
    }

    const pdfContentType =
      pdfResponse.headers.get(
        'content-type'
      ) || ''

    if (
      !pdfContentType.includes(
        'application/pdf'
      )
    ) {
      const responseText =
        await pdfResponse.text()

      console.error(
        'Completion PDF returned unexpected content:',
        pdfContentType,
        responseText.slice(
          0,
          500
        )
      )

      return NextResponse.json(
        {
          success: false,
          error:
            'Completion PDF returned an unexpected response.',
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
      safeFilenamePart(address) ||
      'job'

    const photoResults =
      await Promise.all(
        (
          document.photos || []
        ).map(
          (
            photo: any,
            index: number
          ) =>
            optimisePhoto(
              photo,
              index
            )
        )
      )

    const optimisedPhotos =
      photoResults.filter(
        (
          photo
        ): photo is NonNullable<
          typeof photo
        > => Boolean(photo)
      )

    const attachments: {
      filename: string
      mimeType: string
      base64: string
    }[] = [
      {
        filename:
          `completion-report-${safeAddress}.pdf`,
        mimeType:
          'application/pdf',
        base64:
          pdfBuffer.toString(
            'base64'
          ),
      },
      ...optimisedPhotos.map(
        (photo) => ({
          filename:
            photo.filename,
          mimeType:
            photo.mimeType,
          base64:
            photo.base64,
        })
      ),
    ]

    const totalBytes =
      pdfBuffer.length +
      optimisedPhotos.reduce(
        (
          total,
          photo
        ) =>
          total +
          photo.byteSize,
        0
      )

    const totalMegabytes =
      totalBytes /
      1024 /
      1024

    if (totalMegabytes > 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            'The completion evidence is still too large for email. Please reduce the number of selected photographs or contact the office.',
        },
        { status: 400 }
      )
    }

    const subjectParts = [
      'Completion Report',
      jobNumber,
      address,
    ].filter(Boolean)

    const subject =
      subjectParts.join(' - ')

    const message = [
      'Good afternoon,',
      '',
      'Please find attached the completion report and supporting photographs for the above works.',
      '',
      'Please note: attached photographs have been optimised for email delivery. Full-resolution originals are retained in JobCore and are available on request.',
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

    const text =
      await response.text()

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

    const result =
      JSON.parse(text)

    if (
      !response.ok ||
      !result.success
    ) {
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
      totalSizeMb:
        Number(
          totalMegabytes.toFixed(
            2
          )
        ),
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