'use client'

import Link from 'next/link'
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

  const roleLabel =
    role === 'admin'
      ? 'Admin'
      : role === 'office'
      ? 'Office'
      : role === 'fitter'
      ? 'Fitter'
      : 'User'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full bg-yellow-100 text-slate-900 border border-yellow-300 flex items-center justify-center text-sm font-bold hover:bg-yellow-200 transition cursor-pointer"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden z-50">
          <div className="px-4 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 text-slate-900 border border-yellow-300 flex items-center justify-center text-sm font-bold">
                {initials}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {name || email}
                </p>

                <p className="text-xs text-slate-500 truncate">
                  {email}
                </p>
              </div>
            </div>

            <span className="inline-block mt-3 bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs font-bold">
              {roleLabel}
            </span>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Profile
            </Link>

            <Link
              href="/profile/password"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              Change Password
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  )
}