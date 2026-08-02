'use client'

import { useState } from 'react'
import ActionSheet from './ActionSheet'

type NavigationButtonProps = {
  googleMapsUrl: string
  appleMapsUrl: string
  wazeUrl: string
}

export default function NavigationButton({
  googleMapsUrl,
  appleMapsUrl,
  wazeUrl,
}: NavigationButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 hover:bg-orange-100"
      >
        Navigate
      </button>

      <ActionSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Navigate with"
        actions={[
          {
            label: '🟢 Google Maps',
            href: googleMapsUrl,
          },
          {
            label: '🔵 Waze',
            href: wazeUrl,
          },
          {
            label: '⚪ Apple Maps',
            href: appleMapsUrl,
          },
        ]}
      />
    </>
  )
}