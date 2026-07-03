type JobSummaryCardProps = {
  job: any
}

function valueOrDash(value: any) {
  return value || '—'
}

export default function JobSummaryCard({ job }: JobSummaryCardProps) {
  const address = [
    job?.address_line_1,
    job?.town,
    job?.postcode,
  ]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <p className="text-xs uppercase font-bold text-slate-400 mb-2">
        Job Information
      </p>

      <h2 className="text-xl font-bold text-slate-900">
        {address || 'No address added'}
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-sm">
        <div>
          <p className="text-xs uppercase font-bold text-slate-400">
            Job Number
          </p>
          <p className="font-bold text-slate-900">
            {valueOrDash(job?.job_number)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold text-slate-400">
            PO Number
          </p>
          <p className="font-bold text-slate-900">
            {valueOrDash(job?.po_number)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold text-slate-400">
            Client
          </p>
          <p className="font-bold text-slate-900">
            {valueOrDash(job?.client)}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase font-bold text-slate-400">
            Status
          </p>
          <p className="font-bold text-slate-900">
            {valueOrDash(job?.status_name)}
          </p>
        </div>
      </div>
    </div>
  )
}