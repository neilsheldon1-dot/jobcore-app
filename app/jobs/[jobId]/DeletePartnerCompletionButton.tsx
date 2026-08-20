'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Props = {
  jobId: string
  partnerProfileId: string | null
}

export default function DeletePartnerCompletionButton({
  jobId,
  partnerProfileId,
}: Props) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function deleteCompletion() {
    const confirmed = window.confirm(
      'Delete this Partner Completion Report and reset the job?\n\nThe completion details will be removed and the job will be returned to the partner so it can be completed again. Existing photographs will be kept.'
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      const response = await fetch(
        '/api/delete-partner-completion',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            jobId,
            partnerProfileId,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.error ||
            'Unable to delete partner completion.'
        )
      }

      router.refresh()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : 'Unable to delete partner completion.'
      )
    } finally {
      setDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={deleteCompletion}
      disabled={deleting}
      className="text-xs font-bold text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete Report'}
    </button>
  )
}