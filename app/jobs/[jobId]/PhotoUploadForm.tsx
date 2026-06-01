'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PhotoUploadForm({
  jobId,
  jobAddress,
}: {
  jobId: string
  jobAddress: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)
async function createWatermarkedImage(
  file: File,
  address: string
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
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

      const watermarkText = [
        address,
        dateString,
      ]

      const padding = 20
      const lineHeight = 32

      ctx.fillStyle = 'rgba(0,0,0,0.65)'
      ctx.fillRect(
        0,
        canvas.height - 90,
        canvas.width,
        90
      )

      ctx.fillStyle = 'white'
      ctx.font = 'bold 24px Arial'

      watermarkText.forEach((line, index) => {
        ctx.fillText(
          line,
          padding,
          canvas.height - 50 + index * lineHeight
        )
      })

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Could not create blob'))
            return
          }

          resolve(blob)
        },
        'image/jpeg',
        0.95
      )
    }

    image.onerror = reject

    image.src = URL.createObjectURL(file)
  })
}
  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (files.length === 0) {
      alert('Please choose at least one photo first')
      return
    }

    setLoading(true)

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

const { error: uploadError } = await supabase.storage
  .from('job-photos')
  .upload(filePath, watermarkedFile)

      if (uploadError) {
        alert(uploadError.message)
        setLoading(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('job-photos')
        .getPublicUrl(filePath)

      const response = await fetch('/api/photos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    job_id: jobId,
    file_url: publicUrlData.publicUrl,
    original_file_url: publicUrlData.publicUrl,
    category,
  }),
})

const result = await response.json()

if (!response.ok) {
  alert(JSON.stringify(result.error, null, 2))
  setLoading(false)
  return
}
    }
     

    setFiles([])
    setLoading(false)
    setIsOpen(false)

    window.location.reload()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-5 py-1 rounded-xl font-bold hover:bg-blue-700 transition cursor-pointer"
      >
        + Add New Photo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleUpload}
            className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 w-full max-w-xl"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                Upload Photos
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Photo Category
                </label>

                <input
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Photo description or category"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Photos
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setFiles(Array.from(e.target.files || []))
                  }
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />

                {files.length > 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    {files.length} photo{files.length === 1 ? '' : 's'} selected
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Uploading...' : 'Upload Photos'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}