export type AsbestosDestination = { id: number; name: string }
export type JobDestination = { label: string; href: string }

export const officeNavigation = [
  { label: 'Home', href: '/', section: 'home' },
  { label: 'Properties', href: '/properties', section: 'properties' },
  { label: 'Partners', href: '/partners', section: 'partners' },
  { label: 'Archive', href: '/archive', section: 'archive' },
] as const

export const scaffoldDestinations = [
  { stage: 'Awaiting Quote', label: 'Awaiting Scaffold Quote', accent: 'border-l-orange-500' },
  { stage: 'Quote Received', label: 'Scaffold Quote Received', accent: 'border-l-green-600' },
  { stage: 'Awaiting Erection', label: 'Awaiting Scaffold Erection', accent: 'border-l-orange-600' },
  { stage: 'Scaffold Up', label: 'Scaffold Up', accent: 'border-l-green-600' },
  { stage: 'Awaiting Dismantle', label: 'Awaiting Scaffold Dismantle', accent: 'border-l-purple-600' },
].map((item) => ({
  ...item,
  href: `/jobs?scaffoldPipeline=${encodeURIComponent(item.stage)}`,
}))

export function asbestosDestination(status: AsbestosDestination): JobDestination {
  return {
    label: status.name.toLowerCase().includes('asbestos')
      ? status.name
      : `Asbestos ${status.name}`,
    href: `/jobs?asbestosStatus=${status.id}`,
  }
}

export function jobDestinationGroups(asbestosStatuses: AsbestosDestination[] = []) {
  return [
    {
      label: 'Jobs',
      items: [
        { label: 'All Jobs', href: '/jobs' },
        { label: 'Tickets', href: '/jobs?status=Ticket' },
        { label: 'Ready Jobs', href: '/jobs?ready=true' },
        { label: 'Allocated Jobs', href: '/jobs?status=Allocated' },
        { label: 'Urgent Jobs', href: '/jobs?urgent=true' },
        { label: 'Blocked Jobs', href: '/jobs?blocked=true' },
        { label: 'On Hold', href: '/jobs?onHold=true' },
      ],
    },
    {
      label: 'Office Workflow',
      items: [
        { label: 'Needs Review', href: '/jobs/review' },
        { label: 'Needs Quoting', href: '/jobs?status=Needs%20Quoting' },
        { label: 'Awaiting Approval', href: '/jobs?status=Awaiting%20Approval' },
        { label: 'Needs Invoicing', href: '/jobs?status=Needs%20Invoicing' },
      ],
    },
    { label: 'Scaffold', items: scaffoldDestinations },
    ...(asbestosStatuses.length
      ? [{ label: 'Asbestos', items: asbestosStatuses.map(asbestosDestination) }]
      : []),
  ]
}
