'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function PhotoUploadForm({
  jobId,
}: {
  jobId: string
}) {
  const [file, setFile] = useState<File | null>(null)
  const [category, setCategory] = useState('before')
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
    window.location.reload()
  }

  return (
    <form
      onSubmit={handleUpload}
      className="bg-white rounded-3xl shadow-lg p-8 mt-8"
    >
      <h2 className="text-2xl font-bold mb-4">Upload Photo</h2>

      <input
        value={uploadedBy}
        onChange={(e) => setUploadedBy(e.target.value)}
        placeholder="Uploaded by"
        className="w-full border rounded-xl p-4 mb-4"
      />

      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-full border rounded-xl p-4 mb-4"
      >
        <option value="before">Before</option>
        <option value="during">During</option>
        <option value="after">After</option>
        <option value="scaffold">Scaffold</option>
        <option value="issue">Issue</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="w-full border rounded-xl p-4 mb-4"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-xl"
      >
        {loading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </form>
  )
}