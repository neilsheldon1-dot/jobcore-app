'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type WorkspaceHeaderProps = {
  name?: string | null
  workspace?: 'Rubber Roofs' | 'UPVC Outlet'
}

export default function WorkspaceHeader({
  name,
  workspace = 'Rubber Roofs',
}: WorkspaceHeaderProps) {
  const pathname = usePathname()

  const isJobPage =
    pathname.startsWith('/my-jobs/') &&
    pathname !== '/my-jobs'

  const headerClasses =
    workspace === 'UPVC Outlet'
      ? 'border-b border-slate-800 bg-slate-900'
      : 'border-b border-blue-700 bg-blue-600'

  return (
    <header className={`${headerClasses} text-white shadow-sm`}>
      <div className="mx-auto flex max-w-md items-center justify-between gap-4 px-4 py-4">
        <div className="min-w-0">
          {isJobPage ? (
            <Link
              href={
                workspace === 'UPVC Outlet'
                  ? '/upvc-jobs'
                  : '/my-jobs'
              }
              className="inline-flex items-center text-sm font-bold text-white transition hover:text-slate-200"
            >
              ← Jobs
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