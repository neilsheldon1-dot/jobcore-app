
import Link from 'next/link'
import UserMenu from './UserMenu'
import JobsNavMenu from './JobsNavMenu'
import CreateMenu from './CreateMenu'
import { createClient } from '../app/utils/supabase/server'
import { Search } from 'lucide-react'
import { officeNavigation } from '../lib/jobDestinations'

type AppHeaderProps = {
  active?:
  | 'home'
  | 'jobs'
  | 'my-jobs'
  | 'properties'
  | 'partners'
  | 'archive'
  | 'rams'
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

  const { data: asbestosStatuses, error: asbestosError } = await supabase
    .from('asbestos_statuses')
    .select('id, name')
    .order('sort_order', { ascending: true })

  if (asbestosError) console.error('Jobs navigation asbestos lookup failed:', asbestosError)

  function navClass(section: AppHeaderProps['active']) {
    return active === section
      ? 'border-b-4 border-white h-16 flex items-center'
      : 'hover:text-blue-100'
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-700 to-blue-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto flex min-w-0 items-center h-16 px-3 sm:px-6 gap-3 lg:gap-8">
        <Link href="/" className="flex items-center">
          <img
  src="/jobcore-logo.png"
  alt="JobCore"
  className="h-6 w-auto"
/>
        </Link>

        <div className="flex min-w-0 items-center justify-between gap-3 flex-1">
          <nav className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className={`hidden lg:flex ${navClass('home')}`}>Home</Link>
            <JobsNavMenu active={active === 'jobs'} asbestosStatuses={asbestosStatuses || []} />
            {officeNavigation.filter((item) => item.section !== 'home').map((item) => (
              <Link key={item.href} href={item.href} className={`hidden lg:flex ${navClass(item.section)}`}>{item.label}</Link>
            ))}
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
