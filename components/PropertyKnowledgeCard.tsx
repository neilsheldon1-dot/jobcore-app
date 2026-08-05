type PropertyKnowledgeCardProps = {
  roofCovering?: string | null
  asbestos?: string | null
  lastVisit?: string | null
}

export default function PropertyKnowledgeCard({
  roofCovering,
  asbestos,
  lastVisit,
}: PropertyKnowledgeCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <h2 className="mb-5 text-xs font-bold uppercase tracking-wide text-slate-400">
    Property Knowledge
  </h2>

  <div className="space-y-3">

    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="font-medium text-slate-700">
        Roof Covering
      </span>

      <span className="text-slate-500">
        {roofCovering || 'Not known'}
      </span>
    </div>

    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
      <span className="font-medium text-slate-700">
        Asbestos
      </span>

      <span className="text-slate-500">
        {asbestos || 'Not known'}
      </span>
    </div>

    <div className="flex items-center justify-between">
      <span className="font-medium text-slate-700">
        Last Visit
      </span>

      <span className="text-slate-500">
        {lastVisit || 'Not known'}
      </span>
    </div>

  </div>
</div>
  )
}