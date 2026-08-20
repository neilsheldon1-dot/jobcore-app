import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseAdmin'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const photoIds = body?.photoIds

    if (
      !Array.isArray(photoIds) ||
      photoIds.length === 0
    ) {
      return NextResponse.json(
        { error: 'Please select at least one photo.' },
        { status: 400 }
      )
    }

    const {
      data: photos,
      error: lookupError,
    } = await supabaseAdmin
      .from('photos')
      .select('id, file_url')
      .in('id', photoIds)

    if (lookupError) {
      return NextResponse.json(
        { error: lookupError.message },
        { status: 500 }
      )
    }

    if (!photos || photos.length === 0) {
      return NextResponse.json(
        { error: 'No matching photos were found.' },
        { status: 404 }
      )
    }

    const filePaths = photos
      .map((photo) => {
        const marker = '/job-photos/'

        if (!photo.file_url?.includes(marker)) {
          return null
        }

        return photo.file_url.split(marker)[1]
      })
      .filter(
        (path): path is string => Boolean(path)
      )

    if (filePaths.length > 0) {
      const {
        error: storageError,
      } = await supabaseAdmin.storage
        .from('job-photos')
        .remove(filePaths)

      if (storageError) {
        return NextResponse.json(
          {
            error:
              'Could not remove the selected photo files: ' +
              storageError.message,
          },
          { status: 500 }
        )
      }
    }

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from('photos')
      .delete()
      .in(
        'id',
        photos.map((photo) => photo.id)
      )

    if (deleteError) {
      return NextResponse.json(
        { error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      count: photos.length,
    })
  } catch (error) {
    console.error('Delete photos error:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to delete photos.',
      },
      { status: 500 }
    )
  }
}