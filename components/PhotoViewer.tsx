'use client'

import { useEffect, useId, useRef } from 'react'

export type ViewerPhoto = {
  id: string
  file_url: string
  category?: string | null
  photo_group?: string | null
}

export default function PhotoViewer({
  photos,
  selectedPhotoId,
  onSelect,
  onClose,
}: {
  photos: ViewerPhoto[]
  selectedPhotoId: string | null
  onSelect: (id: string) => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const positionId = useId()
  const index = photos.findIndex((photo) => photo.id === selectedPhotoId)
  const photo = photos[index]
  const isOpen = Boolean(photo)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog || !isOpen) return

    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()
    closeButtonRef.current?.focus()

    function keepFocusInViewer(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const buttons = Array.from(dialog!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'))
      if (!buttons.length) return
      event.preventDefault()
      const current = buttons.findIndex((button) => button === document.activeElement)
      const next = current < 0
        ? (event.shiftKey ? buttons.length - 1 : 0)
        : (current + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length
      buttons[next].focus()
    }

    document.addEventListener('keydown', keepFocusInViewer)

    return () => {
      document.removeEventListener('keydown', keepFocusInViewer)
      dialog.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isOpen])

  if (!photo) return null

  function previous() {
    if (index > 0) onSelect(photos[index - 1].id)
  }

  function next() {
    if (index < photos.length - 1) onSelect(photos[index + 1].id)
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={positionId}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return
        const bounds = event.currentTarget.getBoundingClientRect()
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) onClose()
      }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey) return
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          previous()
        } else if (event.key === 'ArrowRight') {
          event.preventDefault()
          next()
        }
      }}
      className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-5xl overflow-y-auto rounded-2xl border-0 bg-white p-4 text-slate-900 shadow-xl backdrop:bg-black/80"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 id={titleId} className="font-bold">Job photo</h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Close
        </button>
      </div>

      {/* The original evidence URL is retained; navigation loads only the current image. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={photo.id}
        src={photo.file_url}
        alt={photo.category || photo.photo_group || 'Job photo'}
        className="max-h-[calc(100dvh-12rem)] min-h-24 w-full rounded-xl bg-slate-50 object-contain"
      />

      <div className="mt-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={previous}
          disabled={index === 0}
          className="cursor-pointer rounded-lg bg-slate-100 px-3 py-3 text-sm font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <div className="min-w-0 text-center">
          <p id={positionId} aria-live="polite" className="text-sm font-bold">
            {index + 1} of {photos.length}
          </p>
          <p className="mt-1 break-words text-xs text-slate-600">
            {photo.photo_group}{photo.photo_group && photo.category ? ' · ' : ''}{photo.category}
          </p>
        </div>
        <button
          type="button"
          onClick={next}
          disabled={index === photos.length - 1}
          className="cursor-pointer rounded-lg bg-slate-100 px-3 py-3 text-sm font-bold text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </dialog>
  )
}
