'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type FitterHeaderProps = {
  name?: string | null
}

export default function FitterHeader({
  name,
}: FitterHeaderProps) {
  const pathname = usePathname()

  const isJobPage =
    pathname.startsWith('/my-jobs/') &&
    pathname !== '/my-jobs'

  return (
    <header className="border-b border-blue-700 bg-blue-600 text-white shadow-sm">
      <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          {isJobPage ? (
            <Link
              href="/my-jobs"
              className="inline-flex items-center text-sm font-bold text-white transition hover:text-blue-100"
            >
              ← My Jobs
            </Link>
          ) : (
            <img
  src="/jobcore-logo.png"
  alt="JobCore"
  className="h-6 w-auto"
/>
          )}
        </div>

        {name && (
          <p className="truncate text-sm font-bold text-white">
            {name}
          </p>
        )}
      </div>
    </header>
  )
}