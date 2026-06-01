'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function JobsNavMenu({
  active,
}: {
  active?: boolean
}) {
  const [open, setOpen] = useState(false)

  const topClass = active
    ? 'border-b-4 border-white h-16 flex items-center'
    : 'hover:text-blue-100 h-16 flex items-center'

  const items = [
    { label: 'All Jobs', href: '/jobs' },
    { label: 'Tickets', href: '/jobs?status=Ticket' },
    { label: 'Ready Jobs', href: '/jobs?ready=true' },
    { label: 'Blocked Jobs', href: '/jobs?blocked=true' },
    { label: 'Needs Quoting', href: '/jobs?status=Needs%20Quoting' },
    { label: 'Awaiting Approval', href: '/jobs?status=Awaiting%20Approval' },
    { label: 'Needs Invoicing', href: '/jobs?status=Needs%20Invoicing' },
  ]

  return (
    <div
      className="relative h-16 flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href="/jobs" className={topClass}>
        Jobs
      </Link>

      {open && (
        <div className="absolute top-16 left-0 w-60 bg-white text-slate-800 rounded-b-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="py-2">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-sm font-bold hover:bg-slate-50"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}