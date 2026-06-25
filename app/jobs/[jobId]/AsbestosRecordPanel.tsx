'use client'

import { useState } from 'react'

export default function AsbestosRecordPanel({
  jobId,
  asbestosRecord,
  statuses,
  job,
}: any) {
  const [contractorName, setContractorName] = useState(
    asbestosRecord?.contractor_name || ''
  )

  async function setAsbestosStatus(statusName: string) {
    const status = statuses?.find((item: any) => item.name === statusName)

    if (!status) {
      alert(`Status not found: ${statusName}`)
      return
    }

    await fetch('/api/update-asbestos-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        asbestos_status_id: status.id,
      }),
    })

    window.location.reload()
  }

  async function resetAsbestosField(field: string) {
    await fetch('/api/reset-asbestos-record-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        field,
      }),
    })

    window.location.reload()
  }

  async function saveContractor() {
    await fetch('/api/update-asbestos-contractor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        contractor_name: contractorName,
      }),
    })

    window.location.reload()
  }

  function getFullAddress() {
    return [job?.address_line_1, job?.town, job?.postcode]
      .filter(Boolean)
      .join(', ')
  }

  function getReferenceLine() {
    const refs = [
      job?.quote_number ? `Quote: ${job.quote_number}` : null,
      job?.job_number ? `Job: ${job.job_number}` : null,
      job?.po_number ? `PO: ${job.po_number}` : null,
    ].filter(Boolean)

    return refs.length > 0 ? refs.join('\n') : 'No reference added'
  }

  async function createAsbestosDraft(type: 'report' | 'inspection' | 'removal') {
    const fullAddress = getFullAddress()
    const referenceLine = getReferenceLine()

    const subject =
  type === 'report'
    ? `Asbestos report request - ${fullAddress}`
    : type === 'inspection'
    ? `Asbestos inspection request - ${fullAddress}`
    : `Asbestos removal request - ${fullAddress}`

const message =
  type === 'report'
    ? `Please arrange an asbestos report for:

${fullAddress}

${referenceLine}

Work description:
${job?.description || 'No work description added'}

Many thanks`
    : type === 'inspection'
    ? `Please arrange an asbestos inspection for:

${fullAddress}

${referenceLine}

Work description:
${job?.description || 'No work description added'}

Many thanks`
    : `Please arrange asbestos removal for:

${fullAddress}

${referenceLine}

Work description:
${job?.description || 'No work description added'}

Many thanks`

    const response = await fetch('/api/create-scaffold-email-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: '',
        subject,
        message,
      }),
    })

    const result = await response.json()

    if (result.success) {
      alert('Gmail draft created successfully')
    } else {
      alert('Failed to create draft')
    }
  }

  function Row({
    label,
    value,
    field,
    colour = 'bg-green-600',
    draftAction,
  }: {
    label: string
    value: string | null
    field: string
    colour?: string
    draftAction?: () => void
  }) {
    const done = !!value

    async function toggleItem() {
      if (done) {
        await resetAsbestosField(field)
      } else {
        await setAsbestosStatus(label)
      }
    }

    return (
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 px-2 last:border-b-0 min-h-[38px]">
        <button
          type="button"
          onClick={toggleItem}
          className="flex items-center gap-2 min-w-0 text-left"
        >
          <span
            className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
              done
                ? `${colour} text-white border-transparent`
                : 'bg-white border-slate-300 text-transparent'
            }`}
          >
            ✓
          </span>

          <span className="text-xs font-semibold text-slate-800">
            {label}
          </span>
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs font-semibold ${
              done ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {value || 'Not recorded'}
          </span>

          {draftAction && (
            <button
              type="button"
              onClick={draftAction}
              className="bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-slate-50 transition"
            >
              Draft
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 mt-4 pt-4">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-3 py-2">
          <p className="text-xs uppercase font-bold text-slate-400 mb-1">
            Asbestos Record
          </p>

          {asbestosRecord?.safe_to_work_date && (
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-green-100 border border-green-300 px-3 py-1 text-xs font-bold text-green-800">
                ✓ ASBESTOS CLEARED
              </span>
            </div>
          )}

          <Row
            label="Request Report"
            field="report_requested_date"
            value={asbestosRecord?.report_requested_date || null}
            colour="bg-amber-500"
            draftAction={() => createAsbestosDraft('report')}
          />

          <Row
  label="Arrange Inspection"
  field="inspection_date"
  value={asbestosRecord?.inspection_date || null}
  colour="bg-orange-500"
  draftAction={() => createAsbestosDraft('inspection')}
/>

          <Row
            label="Request Removal"
            field="removal_requested_date"
            value={asbestosRecord?.removal_requested_date || null}
            colour="bg-red-600"
            draftAction={() => createAsbestosDraft('removal')}
          />

          <Row
            label="Safe To Work"
            field="safe_to_work_date"
            value={asbestosRecord?.safe_to_work_date || null}
            colour="bg-green-600"
          />

          <div className="pt-3 text-xs">
            <label className="font-semibold text-slate-500">
              Supplier / Contractor
            </label>

            <div className="flex gap-2 mt-1">
              <input
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                placeholder="Not added"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />

              <button
                type="button"
                onClick={saveContractor}
                className="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}