'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export default function CopyButton({
  value,
}: {
  value: string
}) {
  const [copied, setCopied] = useState(false)

  async function copyText() {
    await navigator.clipboard.writeText(value || '')

    setCopied(true)

    setTimeout(() => {
      setCopied(false)
    }, 1200)
  }

  return (
    <button
      type="button"
      onClick={copyText}
      title={copied ? 'Copied!' : 'Copy'}
      className="
        text-slate-400
        hover:text-blue-600
        hover:scale-110
        cursor-pointer
        transition-all
        duration-150
        flex
        items-center
        justify-center
      "
    >
      {copied ? (
        <Check size={18} />
      ) : (
        <Copy size={18} />
      )}
    </button>
  )
}