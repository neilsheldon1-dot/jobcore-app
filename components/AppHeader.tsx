import Image from 'next/image'
import Link from 'next/link'

type AppHeaderProps = {
  active?: 'home' | 'jobs' | 'properties' | 'rams'
}

export default function AppHeader({ active }: AppHeaderProps) {
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

</div>
        </div>
      </div>
    </div>
  )
}