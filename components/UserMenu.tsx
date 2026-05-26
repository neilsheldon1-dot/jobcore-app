'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../app/utils/supabase/client'

export default function UserMenu({
  name,
  role,
  email,
}: {
  name?: string
  role?: string
  email?: string
}) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const initials =
    name
      ?.split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-yellow-100 text-slate-900 border border-yellow-300 flex items-center justify-center text-sm font-bold hover:bg-yellow-200 transition"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-900">
              {name || email}
            </p>

            <p className="text-xs text-slate-500 capitalize">
              {role || 'User'}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}