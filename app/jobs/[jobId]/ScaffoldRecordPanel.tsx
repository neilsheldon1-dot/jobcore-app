'use client'

import { useState } from 'react'

export default function ScaffoldRecordPanel({
  jobId,
  scaffoldRecord,
  job,
}: {
  jobId: string
  scaffoldRecord: any
  job: any
}) {
  const [quoteAmount, setQuoteAmount] = useState(scaffoldRecord?.quote_amount || '')
  const [invoiceAmount, setInvoiceAmount] = useState(scaffoldRecord?.invoice_amount || '')

  async function runAction(endpoint: string) {
    await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })

    window.location.reload()
  }

  async function createEmailDraft(subject: string, message: string) {
    const response = await fetch('/api/create-scaffold-email-draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: 'info@jamieseagerscaffolding.co.uk',
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

  async function createQuoteDraft() {
    await createEmailDraft(
      `Scaffold quote request - ${job.address_line_1}`,
      `Please provide a quotation for scaffolding at the above address.

Works required:

${job.description || ''}

Many thanks

Neil Sheldon`
    )
  }

  async function createErectionDraft() {
    await createEmailDraft(
      `Scaffold erection request - ${job.address_line_1}`,
      `Please erect the scaffold at the above address.

Works required:

${job.description || ''}

Many thanks

Neil Sheldon`
    )
  }

  async function createDismantleDraft() {
    await createEmailDraft(
      `Dismantle scaffolding at ${job.address_line_1}`,
      `Please dismantle the scaffolding at the above address.

Many thanks

Neil Sheldon`
    )
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

    await fetch('/api/scaffold-quote-received', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ job_id: jobId }),
    })

    window.location.reload()
  }

  async function saveInvoiceAmount() {
    await fetch('/api/update-scaffold-invoice-amount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        invoice_amount: invoiceAmount,
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

  async function resetQuote() {
    await fetch('/api/reset-scaffold-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        field: 'quote_received_date',
      }),
    })

    await fetch('/api/reset-scaffold-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: jobId,
        field: 'quote_amount',
      }),
    })

    window.location.reload()
  }

  function formatMoney(value: any) {
    if (!value) return 'Not added'

    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(Number(value))
  }

  function varianceDisplay() {
    if (!scaffoldRecord?.invoice_amount || !scaffoldRecord?.quote_amount) {
      return 'Pending'
    }

    const variance =
      Number(scaffoldRecord.invoice_amount) -
      Number(scaffoldRecord.quote_amount)

    return `${variance >= 0 ? '+' : ''}${formatMoney(variance)}`
  }

  function ChecklistRow({
  label,
  value,
  emptyText,
  endpoint,
  resetFieldName,
  done,
  colour = 'bg-green-600',
  draftAction,
}: {
  label: string
  value: string | null
  emptyText: string
  endpoint: string
  resetFieldName: string
  done: boolean
  colour?: string
  draftAction?: () => void
}) {
  async function toggleItem() {
    if (done) {
      await resetField(resetFieldName)
    } else {
      await runAction(endpoint)
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-2 last:border-b-0 min-h-[38px]">
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
          {value || emptyText}
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
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          <div className="px-3 py-2">
            <p className="text-xs uppercase font-bold text-slate-400 mb-1">
              Scaffold Workflow
            </p>

            <ChecklistRow
              label="Request Quote"
              value={scaffoldRecord?.quote_requested_date}
              emptyText="Not requested"
              endpoint="/api/request-scaffold-quote"
              resetFieldName="quote_requested_date"
              done={!!scaffoldRecord?.quote_requested_date}
              colour="bg-orange-500"
              draftAction={createQuoteDraft}
            />

            <div className="border-b border-slate-100 py-2">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => runAction('/api/scaffold-quote-received')}
                  className="flex items-center gap-2 min-w-0 text-left"
                >
                  <span
                    className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      scaffoldRecord?.quote_received_date ||
                      scaffoldRecord?.quote_amount
                        ? 'bg-green-600 text-white border-transparent'
                        : 'bg-white border-slate-300 text-slate-300'
                    }`}
                  >
                    {scaffoldRecord?.quote_received_date ||
                    scaffoldRecord?.quote_amount
                      ? '✓'
                      : ''}
                  </span>

                  <span className="text-xs font-bold text-slate-900">
                    Quote Received
                  </span>
                </button>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-semibold ${
                      scaffoldRecord?.quote_received_date ||
                      scaffoldRecord?.quote_amount
                        ? 'text-slate-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {scaffoldRecord?.quote_received_date || 'Not received'}
                  </span>

                  {(scaffoldRecord?.quote_received_date ||
                    scaffoldRecord?.quote_amount) && (
                    <button
                      type="button"
                      onClick={resetQuote}
                      className="bg-red-50 border border-red-200 text-red-600 px-1.5 py-0.5 rounded text-[10px] font-bold hover:bg-red-100 transition"
                      title="Clear quote received and amount"
                    >
                      ↺
                    </button>
                  )}
                </div>
              </div>

              {(scaffoldRecord?.quote_received_date ||
                scaffoldRecord?.quote_amount) && (
                <div className="flex items-center gap-2 mt-2 ml-6">
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
              )}
            </div>

            <ChecklistRow
              label="Request Erection"
              value={scaffoldRecord?.erection_requested_date}
              emptyText="Not requested"
              endpoint="/api/request-scaffold-erection"
              resetFieldName="erection_requested_date"
              done={!!scaffoldRecord?.erection_requested_date}
              colour="bg-orange-600"
              draftAction={createErectionDraft}
            />

            <ChecklistRow
              label="Scaffold Up"
              value={scaffoldRecord?.erected_date}
              emptyText="Not erected"
              endpoint="/api/scaffold-erected"
              resetFieldName="erected_date"
              done={!!scaffoldRecord?.erected_date}
              colour="bg-green-600"
            />

            <ChecklistRow
              label="Request Dismantle"
              value={scaffoldRecord?.dismantle_requested_date}
              emptyText="Not requested"
              endpoint="/api/request-scaffold-dismantle"
              resetFieldName="dismantle_requested_date"
              done={!!scaffoldRecord?.dismantle_requested_date}
              colour="bg-purple-600"
              draftAction={createDismantleDraft}
            />

            <ChecklistRow
              label="Scaffold Removed"
              value={scaffoldRecord?.dismantled_date}
              emptyText="Not removed"
              endpoint="/api/scaffold-removed"
              resetFieldName="dismantled_date"
              done={!!scaffoldRecord?.dismantled_date}
              colour="bg-slate-700"
            />
          </div>

          <div className="px-3 py-2">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">
              Scaffold Information
            </p>

            <div className="grid gap-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">
                  Supplier
                </span>

                <span className="font-bold text-slate-900">
                  {scaffoldRecord?.supplier_name || 'Jamie Seager Scaffolding'}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-semibold text-slate-500">
                  Quote Amount
                </span>

                <span className="font-bold text-slate-900">
                  {formatMoney(scaffoldRecord?.quote_amount)}
                </span>
              </div>

              <div className="border-b border-slate-100 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-500">
                    Invoice Amount
                  </span>

                  <span className="font-bold text-slate-900">
                    {formatMoney(scaffoldRecord?.invoice_amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-500">
                    £
                  </span>

                  <input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-20 border border-slate-300 rounded-lg px-2 py-1 text-[11px]"
                  />

                  <button
                    type="button"
                    onClick={saveInvoiceAmount}
                    className="bg-blue-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-500">
                  Quote vs Invoice
                </span>

                <span
                  className={`font-bold ${
                    scaffoldRecord?.invoice_amount &&
                    scaffoldRecord?.quote_amount &&
                    Number(scaffoldRecord.invoice_amount) >
                      Number(scaffoldRecord.quote_amount)
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {varianceDisplay()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}