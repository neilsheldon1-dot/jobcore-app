'use client'

import { useRouter } from 'next/navigation'

export default function DeleteJobButton({
  jobId,
}: {
  jobId: string
}) {
  const router = useRouter()

  async function deleteJob() {
    const confirmed = window.confirm(
      'Delete this job? Only use this for duplicates or mistakes. This cannot be undone.'
    )

    if (!confirmed) return

    const response = await fetch('/api/delete-job', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })

    if (!response.ok) {
      alert('Could not delete job')
      return
    }

    router.push('/jobs')
  }

  return (
    <button
      type="button"
      onClick={deleteJob}
      className="text-red-600 font-bold hover:text-red-800 transition cursor-pointer"
    >
      Delete Job
    </button>
  )
}