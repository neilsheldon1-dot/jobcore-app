'use client'

import { useMemo, useState } from 'react'
import ActionSheet from './ActionSheet'

type CallButtonProps = {
  contactText?: string | null
}

export default function CallButton({
  contactText,
}: CallButtonProps) {
  const [open, setOpen] = useState(false)

  const phoneNumbers = useMemo(() => {
    if (!contactText) return []

    const matches =
      contactText.match(
        /(?:\+44\s?\d{3,4}|0\d{3,4})[\d\s()-]{6,}/g
      ) || []

    return Array.from(
      new Set(
        matches
          .map((number) => number.trim())
          .filter(Boolean)
      )
    )
  }, [contactText])

  if (phoneNumbers.length === 0) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100"
      >
        Call
      </button>

      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Call Tenant"
        actions={phoneNumbers.map((number) => ({
          label: number,
          href: `tel:${number.replace(/[^\d+]/g, '')}`,
        }))}
      />
    </>
  )
}