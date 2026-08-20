'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

type UploadedPhoto = {
  id: string
  job_id: string
  file_url: string
  original_file_url?: string | null
  category?: string | null
  photo_group?: string | null
  created_at?: string
  uploaded_by?: string | null
}

type PhotoUploadFormProps = {
  jobId: string
  jobAddress: string
  defaultCategory?: string
  defaultPhotoGroup?: string
  lockCategory?: boolean
  lockPhotoGroup?: boolean
  buttonLabel?: string
  modalTitle?: string
  reloadOnComplete?: boolean
  onUploadComplete?: (
    uploadedPhotos: UploadedPhoto[]
  ) => void | Promise<void>
}

export default function PhotoUploadForm({
  jobId,
  jobAddress,
  defaultCategory = '',
  defaultPhotoGroup = 'Completed',
  lockCategory = false,
  lockPhotoGroup = false,
  buttonLabel = '+ Add New Photo',
  modalTitle = 'Upload Photos',
  reloadOnComplete = true,
  onUploadComplete,
}: PhotoUploadFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [category, setCategory] = useState(defaultCategory)
  const [photoGroup, setPhotoGroup] = useState(defaultPhotoGroup)
  const [loading, setLoading] = useState(false)

  function resetForm() {
    setFiles([])
    setCategory(defaultCategory)
    setPhotoGroup(defaultPhotoGroup)
  }

  function closeModal() {
    if (loading) return

    resetForm()
    setIsOpen(false)
  }

  async function createWatermarkedImage(
    file: File,
    address: string
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image()
      const objectUrl = URL.createObjectURL(file)

      image.onload = () => {
        URL.revokeObjectURL(objectUrl)

        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        if (!ctx) {
          reject(new Error('Could not create canvas'))
          return
        }

        canvas.width = image.width
        canvas.height = image.height

        ctx.drawImage(image, 0, 0)

        const now = new Date()

        const dateString =
          now.toLocaleDateString('en-GB') +
          ' ' +
          now.toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          })

        const watermarkText = [address, dateString]

        const padding = Math.max(20, canvas.width * 0.02)
        const fontSize = Math.max(20, canvas.width * 0.025)
        const lineHeight = fontSize * 1.35
        const stripHeight =
          lineHeight * watermarkText.length + padding * 1.5
        const stripTop = canvas.height - stripHeight

        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)'
        ctx.fillRect(0, stripTop, canvas.width, stripHeight)

        ctx.fillStyle = 'white'
        ctx.font = `bold ${fontSize}px Arial`
        ctx.textBaseline = 'top'

        watermarkText.forEach((line, index) => {
          ctx.fillText(
            line,
            padding,
            stripTop + padding * 0.6 + index * lineHeight
          )
        })

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Could not create image'))
              return
            }

            resolve(blob)
          },
          'image/jpeg',
          0.92
        )
      }

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl)
        reject(new Error(`Could not read ${file.name}`))
      }

      image.src = objectUrl
    })
  }

  async function handleUpload(e: React.FormEvent) {
  e.preventDefault()

  if (files.length === 0) {
    alert('Please choose at least one photo first')
    return
  }

  if (loading) {
    return
  }

  setLoading(true)

  const uploadedPhotos: UploadedPhoto[] = []

  try {
    for (const file of files) {
      const watermarkedBlob =
        await createWatermarkedImage(
          file,
          jobAddress
        )

      const watermarkedFile = new File(
        [watermarkedBlob],
        file.name,
        {
          type: 'image/jpeg',
        }
      )

      const filePath = `${jobId}/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}-${file.name}`

      const { error: uploadError } =
        await supabase.storage
          .from('job-photos')
          .upload(
            filePath,
            watermarkedFile
          )

      if (uploadError) {
        throw new Error(
          uploadError.message
        )
      }

      const { data: publicUrlData } =
        supabase.storage
          .from('job-photos')
          .getPublicUrl(filePath)

      const response = await fetch(
        '/api/photos',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            job_id: jobId,
            file_url:
              publicUrlData.publicUrl,
            original_file_url:
              publicUrlData.publicUrl,
            category:
              category.trim(),
            photo_group:
              photoGroup,
          }),
        }
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          typeof result.error ===
            'string'
            ? result.error
            : result.error?.message ||
                'Could not save photo'
        )
      }

      const insertedPhoto =
        result.data?.[0]

      if (!insertedPhoto?.id) {
        throw new Error(
          'The photo was uploaded but no photo record was returned'
        )
      }

      uploadedPhotos.push(
        insertedPhoto
      )
    }

    /*
     * At this point the photographs are safely
     * uploaded and recorded in JobCore.
     *
     * Clear the form NOW so the fitter cannot
     * accidentally submit the same files again
     * if a later UI callback has a problem.
     */
    resetForm()
    setIsOpen(false)

    /*
     * Anything below here is post-upload UI /
     * workflow behaviour. A failure here must
     * NOT tell the fitter that the photographs
     * failed to upload.
     */
    if (onUploadComplete) {
      try {
        await onUploadComplete(
          uploadedPhotos
        )
      } catch (callbackError) {
        console.error(
          'Photos uploaded successfully, but post-upload handling failed:',
          callbackError
        )

        alert(
          'Photos uploaded successfully. JobCore could not refresh the workflow automatically, so please reopen the job if needed.'
        )

        return
      }
    }

    if (reloadOnComplete) {
      window.location.reload()
    }
  } catch (error: any) {
    console.error(
      'Photo upload failed:',
      error
    )

    alert(
      error.message ||
        'Could not upload photo'
    )
  } finally {
    setLoading(false)
  }
}

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer rounded-xl bg-blue-500 px-5 py-2 font-bold text-white transition hover:bg-blue-700"
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleUpload}
            className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {modalTitle}
              </h2>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="cursor-pointer text-2xl leading-none text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Upload Group
                </label>

                {lockPhotoGroup ? (
                  <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                    <p className="font-bold text-blue-800">
                      {photoGroup}
                    </p>

                    <p className="mt-1 text-xs text-blue-700">
                      JobCore will organise these photographs automatically.
                    </p>
                  </div>
                ) : (
                  <select
                    value={photoGroup}
                    onChange={(e) =>
                      setPhotoGroup(e.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
                  >
                    <option value="Before">Before</option>
                    <option value="During">During</option>
                    <option value="Completed">Completed</option>
                    <option value="Additional">Additional</option>
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Photo Description
                </label>

                {lockCategory ? (
                  <div className="rounded-xl border border-gray-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                    {category || 'No description required'}
                  </div>
                ) : (
                  <input
                    value={category}
                    onChange={(e) =>
                      setCategory(e.target.value)
                    }
                    placeholder="Optional, e.g. rear access blocked by shed"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3"
                  />
                )}

                {!lockCategory && (
                  <p className="mt-2 text-xs text-slate-500">
                    Optional. Only add a description where it helps explain the photograph.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Photos
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={loading}
                  onChange={(e) =>
                    setFiles(
                      Array.from(e.target.files || [])
                    )
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 disabled:opacity-50"
                />

                {files.length > 0 && (
                  <p className="mt-2 text-sm text-slate-500">
                    {files.length} photo
                    {files.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="cursor-pointer rounded-xl bg-slate-100 px-5 py-3 font-bold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="cursor-pointer rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading
                    ? 'Uploading...'
                    : 'Upload Photos'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}