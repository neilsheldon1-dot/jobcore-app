'use client'

import { useRouter } from 'next/navigation'

export default function DeletePropertyButton({
  propertyId,
}: {
  propertyId: string
}) {
  const router = useRouter()

  async function handleDelete() {
    const confirmed = confirm(
      'Delete this property? This can only be done if no jobs are linked to it.'
    )

    if (!confirmed) return

    const response = await fetch('/api/delete-property', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: propertyId }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Could not delete property')
      return
    }

    router.push('/properties')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="bg-red-50 text-red-700 border border-red-200 px-5 py-3 rounded-xl font-bold hover:bg-red-100 transition"
    >
      Delete Property
    </button>
  )
}