'use client'

import { useEffect } from 'react'

type ActionSheetAction = {
  label: string
  href?: string
  onClick?: () => void
}

type ActionSheetProps = {
  open: boolean
  title: string
  actions: ActionSheetAction[]
  onClose: () => void
}

export default function ActionSheet({
  open,
  title,
  actions,
  onClose,
}: ActionSheetProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />

      <div className="relative z-10 w-full rounded-t-3xl bg-white p-4 shadow-2xl">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-300" />

        <h2 className="mb-3 text-center text-sm font-bold text-slate-700">
          {title}
        </h2>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          {actions.map((action, index) =>
            action.href ? (
              <a
                key={action.label}
                href={action.href}
                target="_blank"
                rel="noreferrer"
                onClick={onClose}
                className={`block px-5 py-4 text-center text-base font-semibold text-slate-900 hover:bg-orange-50 ${
                  index > 0 ? 'border-t border-slate-200' : ''
                }`}
              >
                {action.label}
              </a>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={() => {
                  action.onClick?.()
                  onClose()
                }}
                className={`block w-full px-5 py-4 text-center text-base font-semibold text-slate-900 hover:bg-orange-50 ${
                  index > 0 ? 'border-t border-slate-200' : ''
                }`}
              >
                {action.label}
              </button>
            )
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-2xl bg-slate-100 px-5 py-4 text-base font-bold text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}