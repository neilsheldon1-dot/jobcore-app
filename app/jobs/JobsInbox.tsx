'use client'

import Link from 'next/link'
import { Fragment, useState } from 'react'
import BulkActionsBar, {
  type BulkAction,
} from '@/components/bulk-actions/BulkActionsBar'

export default function JobsInbox({

  jobs,
  blockerLinks,
  jobTypeLinks,
  workflowJobs,
  scaffoldRecords,
  zoneLocations,
  operatives,
  currentStatus,
  initialOperativeFilter = 'ALL',
  enableSelection = false,
}: any) {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [bulkStatus, setBulkStatus] = useState('')
  const [bulkAssignee, setBulkAssignee] = useState('')
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const [operativeFilter, setOperativeFilter] =
  useState(initialOperativeFilter)

  const locationOrder = new Map<
  string,
  {
    areaName: string
    areaOrder: number
    locationOrder: number
  }
>(
    (zoneLocations || []).map((location: any) => [
      location.location_name,
      {
        areaName: location.area_zones?.name || 'Other',
        areaOrder: location.area_zones?.sort_order ?? 999,
        locationOrder: location.sort_order ?? 999,
      },
    ])
  )

  function getAreaName(zone: string) {
    return locationOrder.get(zone)?.areaName || 'Other'
  }

  const filteredJobs = jobs
  .filter((job: any) => {
    const searchText = search.toLowerCase()

    const matchesSearch = [
      job.job_number,
      job.po_number,
      job.address_line_1,
      job.town,
      job.postcode,
      job.client,
      job.description,
      job.status,
      job.job_type,
      job.zone,
      job.assigned_to_name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(searchText)

    const matchesOperative =
      operativeFilter === 'ALL' ||
      job.assigned_user_id === operativeFilter

    return matchesSearch && matchesOperative
  })
  .sort((a: any, b: any) => {
    const aZone = locationOrder.get(a.zone) || {
      areaOrder: 999,
      locationOrder: 999,
    }

    const bZone = locationOrder.get(b.zone) || {
      areaOrder: 999,
      locationOrder: 999,
    }

    return (
      aZone.areaOrder - bZone.areaOrder ||
      aZone.locationOrder - bZone.locationOrder ||
      (a.address_line_1 || '').localeCompare(
        b.address_line_1 || ''
      )
    )
  })


  const selectedJobDetails = filteredJobs.filter(
    (job: any) => selectedJobs.includes(job.job_id)
  )

  const canCreateApprovalChase =
    selectedJobDetails.length > 0 &&
    selectedJobDetails.every(
      (job: any) => job.status === 'Awaiting Approval'
    )

  const canChaseScaffoldQuotes =
    selectedJobDetails.length > 0 &&
    selectedJobDetails.every((job: any) => {
      const scaffoldRecord = scaffoldRecords?.find(
        (record: any) => record.job_id === job.job_id
      )

      return (
        scaffoldRecord?.quote_requested_date &&
        !scaffoldRecord?.quote_received_date
      )
    })
  const availableActions: BulkAction[] = [
    ...(currentStatus !== 'Needs Quoting'
  ? [
      {
        value: 'Needs Quoting',
        label: 'Move to Needs Quoting',
        group: 'Change Status',
      },
    ]
  : []),
    ...(currentStatus !== 'Allocated'
      ? [
          {
            value: 'Allocated',
            label: 'Move to Allocated',
            group: 'Change Status',
          },
        ]
      : []),
     ...(operatives || []).map((operative: any) => ({
  value: `ASSIGN_TO:${operative.id}`,
  label:
    operative.display_name ||
    operative.full_name ||
    operative.email ||
    'Unnamed',
  group: 'Assign Job',
})),
{
  value: 'UNASSIGN_JOBS',
  label: 'Unassign Jobs',
  group: 'Assign Job',
},
    ...(currentStatus !== 'Ready'
      ? [
          {
            value: 'Ready',
            label: 'Move to Ready',
            group: 'Change Status',
          },
        ]
      : []),

    ...(currentStatus !== 'Needs Invoicing'
      ? [
          {
            value: 'Needs Invoicing',
            label: 'Move to Needs Invoicing',
            group: 'Change Status',
          },
        ]
      : []),

    ...(currentStatus !== 'Complete'
      ? [
          {
            value: 'Complete',
            label: 'Move to Complete',
            group: 'Change Status',
          },
        ]
      : []),
{
  value: 'MOVE_TO_ON_HOLD',
  label: 'Move to On Hold',
  group: 'Job',
},
    ...(canCreateApprovalChase
      ? [
          {
            value: 'CHASE_APPROVALS',
            label: 'Create Approval Chase Draft',
            group: 'Communication',
          },
        ]
      : []),

    ...(canChaseScaffoldQuotes
      ? [
          {
            value: 'CHASE_SCAFFOLD_QUOTES',
            label: 'Chase Scaffold Quotes',
            group: 'Communication',
          },
        ]
      : []),
    ...(selectedJobs.length === 1
      ? [
          {
            value: 'EDIT_JOB',
            label: 'Edit Job',
            group: 'Job',
          },
          {
            value: 'OPEN_COMPLETION_PACK',
            label: 'Open Completion Pack',
            group: 'Documents',
          },
        ]
      : []),
    {
      value: 'PRINT_SELECTED',
      label: 'Print Selected',
      group: 'Documents',
    },
  ]
  
async function applyBulkStatus() {
  if (bulkStatus === 'MOVE_TO_ON_HOLD') {
  setBulkUpdating(true)

  try {
    const response = await fetch('/api/bulk-update-on-hold', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_ids: selectedJobs,
        is_on_hold: true,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(
        result.error ||
          'Failed to move selected jobs to On Hold'
      )
      return
    }

    setSelectedJobs([])
    setBulkStatus('')
    window.location.reload()
    return
  } catch (error: any) {
    alert(
      error.message ||
        'Failed to move selected jobs to On Hold'
    )
    return
  } finally {
    setBulkUpdating(false)
  }
}
  if (!bulkStatus) {
    alert('Please choose an action')
    return
  }

  if (selectedJobs.length === 0) {
    alert('Please select at least one job')
    return
  }
if (bulkStatus.startsWith('ASSIGN_TO:')) {
  const assignedUserId = bulkStatus.replace('ASSIGN_TO:', '')

  setBulkUpdating(true)

  try {
    const response = await fetch('/api/bulk-assign-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_ids: selectedJobs,
        assigned_user_id: assignedUserId,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Failed to assign jobs')
      return
    }

    setSelectedJobs([])
    setBulkStatus('')
    window.location.reload()
    return
  } catch (error: any) {
    alert(error.message || 'Failed to assign jobs')
    return
  } finally {
    setBulkUpdating(false)
  }
}
if (bulkStatus === 'UNASSIGN_JOBS') {
  setBulkUpdating(true)

  try {
    const response = await fetch('/api/bulk-assign-jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_ids: selectedJobs,
        assigned_user_id: null,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Failed to unassign jobs')
      return
    }

    setSelectedJobs([])
    setBulkStatus('')
    window.location.reload()
    return
  } catch (error: any) {
    alert(error.message || 'Failed to unassign jobs')
    return
  } finally {
    setBulkUpdating(false)
  }
}
  if (bulkStatus === 'CHASE_APPROVALS') {
    await createApprovalChaseDraft()
    return
  }

  if (bulkStatus === 'CHASE_SCAFFOLD_QUOTES') {
    await createScaffoldQuoteChaseDraft()
    return
  }

    if (bulkStatus === 'PRINT_SELECTED') {
    printSelected()
    return
  }
    if (bulkStatus === 'EDIT_JOB') {
      window.location.href = `/jobs/${selectedJobs[0]}/edit`
      return
    }

    if (bulkStatus === 'OPEN_COMPLETION_PACK') {
      window.location.href = `/jobs/${selectedJobs[0]}/documents/completion-pack`
      return
    }
  setBulkUpdating(true)

  try {
    const response = await fetch('/api/bulk-update-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        job_ids: selectedJobs,
        status: bulkStatus,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(
        result.error?.message ||
          result.error ||
          'Failed to update selected jobs'
      )
      return
    }

    setSelectedJobs([])
    setBulkStatus('')
    window.location.reload()
  } catch (error: any) {
    alert(error.message || 'Failed to update selected jobs')
  } finally {
    setBulkUpdating(false)
  }
}

  const areaCounts = filteredJobs.reduce(
    (counts: Record<string, number>, job: any) => {
      const areaName = getAreaName(job.zone)

      counts[areaName] = (counts[areaName] || 0) + 1

      return counts
    },
    {}
  )

  function getStatusColour(status: string) {
    switch (status) {
      case 'Ticket':
        return 'bg-pink-500'
      case 'Allocated':
        return 'bg-emerald-500'
      case 'Needs Quoting':
        return 'bg-purple-500'
      case 'Awaiting Approval':
        return 'bg-orange-500'
      case 'Ready':
        return 'bg-emerald-600'
      case 'Needs Invoicing':
        return 'bg-indigo-700'
      case 'Complete':
        return 'bg-green-700'
      default:
        return 'bg-slate-400'
    }
  }

  function getStatusLetter(status: string) {
    switch (status) {
      case 'Ticket':
        return 'T'
      case 'Allocated':
        return '✓A'
      case 'Needs Quoting':
        return '£Q'
      case 'Awaiting Approval':
        return '?'
      case 'Ready':
        return '✓R'
      case 'Needs Invoicing':
        return '£i'
      case 'Complete':
        return '✅'
      default:
        return 'x'
    }
  }

  function getJobTypeStyle(jobType: string) {
    return jobType === 'Reactive'
      ? 'bg-lime-100 text-lime-800 border border-lime-200'
      : jobType === 'Flat Roof'
      ? 'bg-sky-100 text-sky-700 border border-sky-200'
      : jobType === 'Re Roof'
      ? 'bg-sky-400 text-white border border-blue-900'
      : jobType === 'Sika Roof'
      ? 'bg-cyan-100 text-cyan-800 border border-cyan-200'
      : jobType === 'Roofline / EPS'
      ? 'bg-orange-100 text-orange-700 border border-orange-200'
      : jobType === 'Hydro'
      ? 'bg-teal-100 text-teal-800 border border-teal-200'
      : jobType === 'Scheme'
      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
      : jobType === 'General Building'
      ? 'bg-green-200 text-green-700 border border-slate-200'
      : jobType === 'Slate / Tile Repair'
      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
      : jobType === 'Roof Repair'
      ? 'bg-violet-100 text-violet-700 border border-violet-200'
      : jobType === 'Gutter Work'
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
      : jobType === 'Chimney'
      ? 'bg-rose-100 text-rose-700 border border-rose-200'
      : jobType === 'Lead Work'
      ? 'bg-zinc-300 text-zinc-900 border border-zinc-500'
      : jobType === 'Survey / Inspection'
      ? 'bg-pink-100 text-black border border-pink-200'
      : jobType === 'Pointing'
      ? 'bg-stone-400 text-white border border-stone-300'
      : jobType === 'Fascia / Soffit'
      ? 'bg-purple-900 text-white border border-stone-300'
      : 'bg-slate-100 text-slate-700 border border-slate-200'
  }

  function getScaffoldWorkflowStyle(statusName: string) {
    switch (statusName) {
      case 'Awaiting Quote':
        return 'bg-amber-50 text-amber-800 border border-amber-300'
      case 'Quote Received':
        return 'bg-blue-50 text-blue-800 border border-blue-300'
      case 'Awaiting Erection':
        return 'bg-orange-50 text-orange-800 border border-orange-300'
      case 'Scaffold Up':
        return 'bg-green-50 text-green-800 border border-green-300'
      case 'Needs Adapting':
        return 'bg-red-50 text-red-800 border border-red-300'
      case 'Awaiting Dismantle':
        return 'bg-purple-50 text-purple-800 border border-purple-300'
      case 'Scaffold Removed':
        return 'bg-slate-100 text-slate-700 border border-slate-300'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  function getAsbestosWorkflowStyle(statusName: string) {
    switch (statusName) {
      case 'Report Requested':
        return 'bg-amber-50 text-amber-800 border border-amber-300'
      case 'Inspection Required':
        return 'bg-orange-50 text-orange-800 border border-orange-300'
      case 'Removal Required':
        return 'bg-red-50 text-red-800 border border-red-300'
      case 'Safe To Work':
        return 'bg-green-50 text-green-800 border border-green-300'
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200'
    }
  }

  function toggleJob(jobId: string) {
    setSelectedJobs((previous) =>
      previous.includes(jobId)
        ? previous.filter((id) => id !== jobId)
        : [...previous, jobId]
    )
  }

  function toggleAll() {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([])
    } else {
      setSelectedJobs(
        filteredJobs.map((job: any) => job.job_id)
      )
    }
  }

  function getScaffoldWorkflowName(jobId: string) {
    const record = scaffoldRecords?.find(
      (item: any) => item.job_id === jobId
    )

    if (!record) return null

    if (
      record.dismantle_requested_date &&
      !record.dismantled_date
    ) {
      return 'Awaiting Dismantle'
    }

    if (
      record.erected_date &&
      !record.dismantle_requested_date
    ) {
      return 'Scaffold Up'
    }

    if (
      record.erection_requested_date &&
      !record.erected_date
    ) {
      return 'Awaiting Erection'
    }

    if (
      record.quote_received_date &&
      !record.erection_requested_date
    ) {
      return 'Quote Received'
    }

    if (
      record.quote_requested_date &&
      !record.quote_received_date
    ) {
      return 'Awaiting Quote'
    }

    return null
  }

  function printSelected() {
    const printUrl = `/jobs/print?ids=${selectedJobs.join(',')}`
    window.open(printUrl, '_blank')
  }

  async function createApprovalChaseDraft() {
    const selectedAddresses = filteredJobs
      .filter((job: any) =>
        selectedJobs.includes(job.job_id)
      )
      .map((job: any) => {
        const quoteNumber = job.quote_number
          ? `Quote ${job.quote_number}`
          : null

        const jobPoNumber = [
          job.job_number,
          job.po_number,
        ]
          .filter(Boolean)
          .join(' / ')

        const reference = [
          quoteNumber,
          jobPoNumber,
        ]
          .filter(Boolean)
          .join(' | ')

        const address = `${job.address_line_1}${
          job.town ? `, ${job.town}` : ''
        }${job.postcode ? `, ${job.postcode}` : ''}`

        return `• ${
          reference ? `${reference} - ` : ''
        }${address}`
      })
      .join('\n')

    const greeting =
      new Date().getHours() < 12
        ? 'Good morning'
        : new Date().getHours() < 17
        ? 'Good afternoon'
        : 'Good evening'

    const response = await fetch(
      '/api/create-scaffold-email-draft',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '',
          subject: `Awaiting Approval Chase - ${selectedJobs.length} Jobs`,
          message: `${greeting},

Please could you provide an update on the following jobs:

${selectedAddresses}

Many thanks

Ian Jackson`,
        }),
      }
    )

    const result = await response.json()

    if (result.success) {
      alert('Gmail draft created successfully')
    } else {
      alert('Failed to create draft')
    }
  }
async function createScaffoldQuoteChaseDraft() {
  const selectedJobDetails = filteredJobs.filter((job: any) =>
    selectedJobs.includes(job.job_id)
  )

  const outstandingJobs = selectedJobDetails.filter((job: any) => {
    const scaffoldRecord = scaffoldRecords?.find(
      (record: any) => record.job_id === job.job_id
    )

    return (
      scaffoldRecord?.quote_requested_date &&
      !scaffoldRecord?.quote_received_date
    )
  })

  if (outstandingJobs.length === 0) {
    alert(
      'None of the selected jobs have an outstanding scaffold quotation'
    )
    return
  }

  

  const greeting =
    new Date().getHours() < 12
      ? 'Good morning'
      : new Date().getHours() < 17
      ? 'Good afternoon'
      : 'Good evening'

  const jobList = outstandingJobs
    .map((job: any) => {
      const address = [
        job.address_line_1,
        job.town,
        job.postcode,
      ]
        .filter(Boolean)
        .join(', ')

      const reference = [
        job.job_number,
        job.po_number,
      ]
        .filter(Boolean)
        .join(' / ')

      return `• ${reference ? `${reference} - ` : ''}${address}

Works required:
${job.description || 'No description recorded'}`
    })
    .join('\n\n')

  setBulkUpdating(true)

  try {
    const response = await fetch(
      '/api/create-scaffold-email-draft',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: '',
          subject: `Outstanding scaffold quotations - ${outstandingJobs.length} jobs`,
          message: `${greeting},

Please could you provide an update on the following outstanding scaffold quotations:

${jobList}

Many thanks

Neil Sheldon`,
        }),
      }
    )

    const result = await response.json()

    if (!response.ok || !result.success) {
      alert(
        result.error ||
          'Failed to create scaffold quote chase draft'
      )
      return
    }

    alert('Scaffold quote chase draft created successfully')

    setSelectedJobs([])
    setBulkStatus('')
  } catch (error: any) {
    alert(
      error.message ||
        'Failed to create scaffold quote chase draft'
    )
  } finally {
    setBulkUpdating(false)
  }
}
  return (
    <>
      <div className="mb-6">
        <input
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search address, postcode, client, description..."
          className="w-full border border-gray-300 rounded-2xl px-5 py-4 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
{currentStatus === 'Allocated' && (
  <div className="mb-5 flex flex-wrap gap-2">
    <button
      type="button"
      onClick={() => setOperativeFilter('ALL')}
      className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
        operativeFilter === 'ALL'
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
      }`}
    >
      All
    </button>

    {(operatives || []).map((operative: any) => {
      const label =
        operative.display_name ||
        operative.full_name ||
        operative.email ||
        'Unnamed'

      return (
        <button
          key={operative.id}
          type="button"
          onClick={() => setOperativeFilter(operative.id)}
          className={`px-4 py-2 rounded-xl text-sm font-bold border transition cursor-pointer ${
            operativeFilter === operative.id
              ? 'bg-orange-500 text-white border-orange-600'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-orange-50'
          }`}
        >
          {label}
        </button>
      )
    })}
  </div>
)}
      {enableSelection && (
  <BulkActionsBar
  selectedCount={selectedJobs.length}
  selectedAction={bulkStatus}
  selectedAssignee={bulkAssignee}
  assignees={operatives || []}
  updating={bulkUpdating}
  actions={availableActions}
  onActionChange={setBulkStatus}
  onAssigneeChange={setBulkAssignee}
  onApply={applyBulkStatus}
/>
)}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {enableSelection && (
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-4">
            <input
              type="checkbox"
              checked={
                filteredJobs.length > 0 &&
                selectedJobs.length === filteredJobs.length
              }
              onChange={toggleAll}
              className="h-4 w-4"
            />

            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Select All ({filteredJobs.length})
            </p>
          </div>
        )}

        <div className="divide-y divide-slate-200">
          {filteredJobs.map(
            (job: any, index: number) => {
              const jobBlockers =
                blockerLinks?.filter(
                  (link: any) =>
                    link.job_id === job.job_id
                ) || []

              const jobTypes =
                jobTypeLinks?.filter(
                  (link: any) =>
                    link.job_id === job.job_id
                ) || []

              const workflowJob =
                workflowJobs?.find(
                  (workflow: any) =>
                    workflow.id === job.job_id
                ) || null

              const scaffoldStatusName =
                getScaffoldWorkflowName(job.job_id)

              const asbestosStatusName =
                workflowJob?.asbestos_statuses?.name

              const jobHasBlockers =
                jobBlockers.length > 0

              const areaName = getAreaName(job.zone)

              const previousAreaName =
                index > 0
                  ? getAreaName(
                      filteredJobs[index - 1].zone
                    )
                  : null

              const showAreaHeading =
                index === 0 ||
                areaName !== previousAreaName

              return (
                <Fragment key={job.job_id}>
                  {showAreaHeading && (
                    <div className="bg-slate-100 border-y border-slate-300 px-5 py-2.5">
                      <p className="text-xs font-black uppercase tracking-wide text-slate-700">
                        {areaName} (
                        {areaCounts[areaName] || 0})
                      </p>
                    </div>
                  )}

                  <div
                    className={`flex items-center gap-4 px-5 py-3 transition ${
                      job.urgent
                        ? 'bg-red-50 hover:bg-red-100'
                        : jobHasBlockers
                        ? 'bg-amber-50 hover:bg-amber-100'
                        : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    {enableSelection && (
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(
                          job.job_id
                        )}
                        onChange={() =>
                          toggleJob(job.job_id)
                        }
                        className="h-4 w-4 shrink-0"
                      />
                    )}

                    <Link
                      href={`/jobs/${job.job_id}`}
                      className="flex items-center justify-between gap-4 flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getStatusColour(
                            job.status
                          )}`}
                        >
                          {getStatusLetter(job.status)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-sm text-slate-900 truncate">
                            {[
                              job.address_line_1,
                              job.town,
                              job.postcode,
                            ]
                              .filter(Boolean)
                              .join(', ')}
                          </p>

                          <p className="text-xs text-slate-500 truncate mt-1">
                            {job.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2 shrink-0">
                       {job.assigned_to_name && (
  <span className="bg-orange-500 text-white border border-transparent px-2.5 py-0.5 rounded-full text-xs font-bold">
    👤 {job.assigned_to_name}
  </span>
)}
                       
                        {job.zone && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            {job.zone.replace(
                              /^\d+\s*-\s*/,
                              ''
                            )}
                          </span>
                        )}

                        {jobTypes.length > 0 ? (
                          jobTypes.map(
                            (jobType: any) => (
                              <span
                                key={jobType.id}
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getJobTypeStyle(
                                  jobType.job_types?.name
                                )}`}
                              >
                                {
                                  jobType.job_types
                                    ?.name
                                }
                              </span>
                            )
                          )
                        ) : (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getJobTypeStyle(
                              job.job_type
                            )}`}
                          >
                            {job.job_type}
                          </span>
                        )}

                        {job.urgent && (
                          <span className="bg-red-700 text-white border-2 border-red-900 px-3 py-1 rounded-full text-xs font-black tracking-wide print:bg-white print:text-black print:border-black">
                            URGENT
                          </span>
                        )}

                        {jobBlockers.map(
                          (
                            blocker: any,
                            blockerIndex: number
                          ) => {
                            const blockerName =
                              blocker.blocker_types
                                ?.name

                            if (
                              blockerName ===
                                'Scaffold' &&
                              scaffoldStatusName
                            ) {
                              return (
                                <span
                                  key={
                                    blockerIndex
                                  }
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getScaffoldWorkflowStyle(
                                    scaffoldStatusName
                                  )}`}
                                >
                                  Scaffold:{' '}
                                  {
                                    scaffoldStatusName
                                  }
                                </span>
                              )
                            }

                            if (
                              blockerName ===
                                'Asbestos' &&
                              asbestosStatusName
                            ) {
                              return (
                                <span
                                  key={
                                    blockerIndex
                                  }
                                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getAsbestosWorkflowStyle(
                                    asbestosStatusName
                                  )}`}
                                >
                                  Asbestos:{' '}
                                  {
                                    asbestosStatusName
                                  }
                                </span>
                              )
                            }

                            return (
                              <span
                                key={blockerIndex}
                                className="bg-amber-100 text-amber-800 border border-amber-300 px-2.5 py-0.5 rounded-full text-xs font-bold"
                              >
                                {blockerName}
                              </span>
                            )
                          }
                        )}

                        {asbestosStatusName ===
                          'Safe To Work' && (
                          <span className="bg-green-50 text-green-800 border border-green-300 px-2.5 py-0.5 rounded-full text-xs font-bold">
                            Asbestos: Safe To Work
                          </span>
                        )}
                      </div>
                    </Link>
                  </div>
                </Fragment>
              )
            }
          )}
        </div>
      </div>
    </>
  )
}