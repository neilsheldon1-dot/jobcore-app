import Image from 'next/image'
import Link from 'next/link'
import UserMenu from './UserMenu'
import { createClient } from '../app/utils/supabase/server'

type AppHeaderProps = {
  active?: 'home' | 'jobs' | 'properties' | 'rams'
}

export default async function AppHeader({ active }: AppHeaderProps) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()
    : { data: null }

  function navClass(section: AppHeaderProps['active']) {
    return active === section
      ? 'border-b-4 border-white h-16 flex items-center'
      : 'hover:text-blue-100'
  }

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex items-center h-16 px-6 gap-8">

        <Link href="/" className="flex items-center">
          <Image
            src="/jobcore-logo.png"
            alt="JobCore"
            width={240}
            height={60}
            className="h-6 w-auto"
            priority
          />
        </Link>

        <div className="flex items-center justify-between flex-1">
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className={navClass('home')}>
              Home
            </Link>

            <Link href="/jobs" className={navClass('jobs')}>
              Jobs
            </Link>

            <Link href="/properties" className={navClass('properties')}>
              Properties
            </Link>
          </nav>

          <div className="flex items-center gap-4">

            

           

            <div className="flex items-center gap-3">
              <Link
                href="/jobs/quick"
                className="bg-white text-pink-500 px-5 py-2 rounded-xl font-bold hover:bg-pink-100 transition shadow-sm"
              >
                + Quick Ticket
              </Link>

              <Link
                href="/jobs/new"
                className="bg-white text-blue-700 px-5 py-2 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm"
              >
                + Add Job
              </Link>
              {profile && (
  <UserMenu
    name={profile.full_name}
    role={profile.role}
    email={user?.email}
  />
)}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}