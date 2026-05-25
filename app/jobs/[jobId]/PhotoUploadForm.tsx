'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PhotoUploadForm({
  jobId,
}: {
  jobId: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('')
  const [uploadedBy, setUploadedBy] = useState('Neil')
  const [loading, setLoading] = useState(false)

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()

    if (!file) {
      alert('Please choose a photo first')
      return
    }

    setLoading(true)

    const filePath = `${jobId}/${Date.now()}-${file.name}`

    const { error: uploadError } = await supabase.storage
      .from('job-photos')
      .upload(filePath, file)

    if (uploadError) {
      alert(uploadError.message)
      setLoading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('job-photos')
      .getPublicUrl(filePath)

    const { error: dbError } = await supabase
      .from('photos')
      .insert([
        {
          job_id: jobId,
          file_url: publicUrlData.publicUrl,
          original_file_url: publicUrlData.publicUrl,
          category,
          uploaded_by: uploadedBy,
          watermark_applied: false,
        },
      ])

    if (dbError) {
      alert(dbError.message)
      setLoading(false)
      return
    }

    setFile(null)
    setLoading(false)
    setIsOpen(false)

    window.location.reload()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-5 py-1 rounded-xl font-bold hover:bg-blue-700 transition"
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
                Upload Photo
              </h2>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Uploaded By
                </label>

                <input
                  value={uploadedBy}
                  onChange={(e) => setUploadedBy(e.target.value)}
                  placeholder="Uploaded by"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

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
                  Photo
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-bold hover:bg-slate-200 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  )
}