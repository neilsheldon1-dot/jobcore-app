'use client'

import { useState } from 'react'

export default function ScaffoldRecordPanel({
  jobId,
  scaffoldRecord,
}: {
  jobId: string
  scaffoldRecord: any
}) {
  const [quoteAmount, setQuoteAmount] = useState(
    scaffoldRecord?.quote_amount || ''
  )

  async function runAction(endpoint: string) {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })

    window.location.reload()
  }

  async function saveQuoteAmount() {
    await fetch('/api/update-scaffold-quote-amount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        quote_amount: quoteAmount,
      }),
    })

    window.location.reload()
  }

  async function resetField(field: string) {
    await fetch('/api/reset-scaffold-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        field,
      }),
    })

    window.location.reload()
  }

  function TimelineRow({
    label,
    value,
    emptyText,
    actionLabel,
    endpoint,
    resetFieldName,
    done,
    colour = 'bg-slate-500',
  }: {
    label: string
    value: string | null
    emptyText: string
    actionLabel: string
    endpoint: string
    resetFieldName: string
    done: boolean
    colour?: string
  }) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2 items-center border-b border-slate-100 py-2 last:border-b-0">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${
              done ? colour : 'bg-slate-300'
            }`}
          >
            {done ? '✓' : '○'}
          </span>

          <p className="text-xs font-semibold text-slate-800">
            {label}
          </p>
        </div>

        <p className={`text-xs font-semibold ${done ? 'text-slate-900' : 'text-slate-400'}`}>
          {value || emptyText}
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => runAction(endpoint)}
            className="bg-white border border-slate-300 text-slate-700 px-2 py-1 rounded-lg text-[11px] font-bold hover:bg-slate-50 transition"
          >
            {done ? 'Update' : actionLabel}
          </button>

          {done && (
            <button
              type="button"
              onClick={() => resetField(resetFieldName)}
              className="bg-red-50 border border-red-200 text-red-600 px-2 py-1 rounded-lg text-[11px] font-bold hover:bg-red-100 transition"
              title="Clear this date"
            >
              ↺
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-slate-200 mt-4 pt-4">
      <p className="text-xs text-slate-500 mb-2">
        Supplier: {scaffoldRecord?.supplier_name || 'Jamie Seager Scaffolding'}
      </p>

      <div className="bg-white border border-slate-200 rounded-xl px-3 py-1">
        <TimelineRow
          label="Request Quote"
          value={scaffoldRecord?.quote_requested_date}
          emptyText="Not requested"
          actionLabel="Request"
          endpoint="/api/request-scaffold-quote"
          resetFieldName="quote_requested_date"
          done={!!scaffoldRecord?.quote_requested_date}
          colour="bg-orange-500"
        />

        <TimelineRow
          label="Quote Received"
          value={
            scaffoldRecord?.quote_received_date
              ? `${scaffoldRecord.quote_received_date}${
                  scaffoldRecord?.quote_amount
                    ? ` (£${Number(scaffoldRecord.quote_amount).toLocaleString()})`
                    : ''
                }`
              : null
          }
          emptyText="Not received"
          actionLabel="Mark Received"
          endpoint="/api/scaffold-quote-received"
          resetFieldName="quote_received_date"
          done={!!scaffoldRecord?.quote_received_date}
          colour="bg-green-600"
        />

        <div className="flex flex-wrap items-center justify-end gap-2 border-b border-slate-100 py-2">
          <span className="text-[11px] font-semibold text-slate-500">
            Quote amount
          </span>

          <span className="text-[11px] font-semibold text-slate-500">
            £
          </span>

          <input
            type="number"
            step="0.01"
            value={quoteAmount}
            onChange={(e) => setQuoteAmount(e.target.value)}
            placeholder="0.00"
            className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-[11px]"
          />

          <button
            type="button"
            onClick={saveQuoteAmount}
            className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition"
          >
            Save
          </button>
        </div>

        <TimelineRow
          label="Request Erection"
          value={scaffoldRecord?.erection_requested_date}
          emptyText="Not requested"
          actionLabel="Request"
          endpoint="/api/request-scaffold-erection"
          resetFieldName="erection_requested_date"
          done={!!scaffoldRecord?.erection_requested_date}
          colour="bg-orange-600"
        />

        <TimelineRow
          label="Scaffold Up"
          value={scaffoldRecord?.erected_date}
          emptyText="Not erected"
          actionLabel="Mark Up"
          endpoint="/api/scaffold-erected"
          resetFieldName="erected_date"
          done={!!scaffoldRecord?.erected_date}
          colour="bg-green-600"
        />

        <TimelineRow
          label="Request Dismantle"
          value={scaffoldRecord?.dismantle_requested_date}
          emptyText="Not requested"
          actionLabel="Request"
          endpoint="/api/request-scaffold-dismantle"
          resetFieldName="dismantle_requested_date"
          done={!!scaffoldRecord?.dismantle_requested_date}
          colour="bg-purple-600"
        />

        <TimelineRow
          label="Scaffold Removed"
          value={scaffoldRecord?.dismantled_date}
          emptyText="Not removed"
          actionLabel="Mark Removed"
          endpoint="/api/scaffold-removed"
          resetFieldName="dismantled_date"
          done={!!scaffoldRecord?.dismantled_date}
          colour="bg-slate-700"
        />
      </div>
    </div>
  )
}