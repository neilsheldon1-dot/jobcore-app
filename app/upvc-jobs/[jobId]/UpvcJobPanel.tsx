'use client'

import { useState } from 'react'

type Props = {
  jobId: string
  jobAddress: string
}

export default function UpvcJobPanel({
  jobId,
}: Props) {
  const [accepted, setAccepted] = useState(false)

  async function acceptJob() {
    setAccepted(true)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      {!accepted ? (
        <>
          <h2 className="text-lg font-bold text-slate-900">
            Ready to Start
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Accept this job when you arrive on site.
          </p>

          <button
            onClick={acceptJob}
            className="mt-6 w-full rounded-xl bg-orange-500 px-4 py-3 font-bold text-white hover:bg-orange-600"
          >
            Accept Job
          </button>
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold text-slate-900">
            Job Accepted
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            The UPVC workflow will continue from here.
          </p>

          <button
            className="mt-6 w-full rounded-xl bg-green-600 px-4 py-3 font-bold text-white"
          >
            Complete Job
          </button>
        </>
      )}

    </div>
  )
}