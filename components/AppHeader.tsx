import Image from 'next/image'
import Link from 'next/link'
import UserMenu from './UserMenu'
import JobsNavMenu from './JobsNavMenu'
import CreateMenu from './CreateMenu'
import { createClient } from '../app/utils/supabase/server'
import { Search } from 'lucide-react'

type AppHeaderProps = {
  active?: 'home' | 'jobs' | 'properties' | 'archive' | 'rams'
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
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md">
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

            <JobsNavMenu active={active === 'jobs'} />

            <Link href="/properties" className={navClass('properties')}>
              Properties
            </Link>

            <Link href="/archive" className={navClass('archive')}>
              Archive
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Search"
              className="w-10 h-10 rounded-full bg-blue-600/70 hover:bg-blue-800/70 flex items-center justify-center transition"
            >
              <Search size={20} />
            </button>

            <CreateMenu />

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
  )
}