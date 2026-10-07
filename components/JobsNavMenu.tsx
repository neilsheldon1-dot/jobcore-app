'use client'

import Link from 'next/link'
import { useEffect, useId, useRef, useState } from 'react'
import { jobDestinationGroups, officeNavigation, type AsbestosDestination } from '../lib/jobDestinations'

export default function JobsNavMenu({
  active,
  asbestosStatuses = [],
}: {
  active?: boolean
  asbestosStatuses?: AsbestosDestination[]
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function closeOutside(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOutside)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOutside)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div
      ref={containerRef}
      className="relative flex h-16 items-center"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-16 cursor-pointer items-center gap-1 focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white ${
          active ? 'border-b-4 border-white' : 'hover:text-blue-100'
        }`}
      >
        Jobs <span aria-hidden="true" className="text-xs">▾</span>
      </button>

      {open && (
        <nav
          id={panelId}
          aria-label="Jobs destinations"
          className="fixed left-4 right-4 top-16 z-50 max-h-[calc(100dvh-5rem)] overflow-y-auto rounded-b-2xl border border-slate-200 bg-white py-2 text-slate-800 shadow-xl sm:absolute sm:left-0 sm:right-auto sm:w-72"
        >
          <div className="lg:hidden">
            <p className="px-4 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-slate-500">Navigation</p>
            {officeNavigation.map((item) => (
              <Link key={item.href} href={item.href} prefetch={false} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 text-sm font-bold hover:bg-slate-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600">
                {item.label}
              </Link>
            ))}
          </div>
          {jobDestinationGroups(asbestosStatuses).map((group) => (
            <div key={group.label}>
              <p className="px-4 pb-1 pt-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {group.label}
              </p>
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm font-bold hover:bg-slate-50 focus-visible:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-600"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      )}
    </div>
  )
}
