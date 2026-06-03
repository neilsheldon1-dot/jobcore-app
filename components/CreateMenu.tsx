'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function CreateMenu() {
  const [open, setOpen] = useState(false)

  return (
    <div
  className="relative"

>
      <button
        type="button"
        title="Create new"
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-blue-600/70 hover:bg-blue-800/70 flex items-center justify-center transition cursor-pointer"
      >
        <Plus size={26} />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="px-6 py-4 text-sm font-bold uppercase text-slate-500 border-b">
            Create New
          </div>

          <Link
            href="/jobs/quick"
            className="block px-6 py-4 text-lg font-semibold hover:bg-slate-50"
          >
            Quick Ticket
          </Link>

          <Link
            href="/jobs/new"
            className="block px-6 py-4 text-lg font-semibold hover:bg-slate-50"
          >
            New Job
          </Link>

          <Link
            href="/properties/new"
            className="block px-6 py-4 text-lg font-semibold hover:bg-slate-50"
          >
            New Property
          </Link>
        </div>
      )}
    </div>
  )
}