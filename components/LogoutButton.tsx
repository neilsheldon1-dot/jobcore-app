'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '../app/utils/supabase/client'

export default function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="text-xs text-blue-100 hover:text-white font-bold"
    >
      Logout
    </button>
  )
}