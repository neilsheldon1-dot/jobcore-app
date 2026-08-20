type PreviewPanelProps = {
  document: any
}

export default function PreviewPanel({
  document,
}: PreviewPanelProps) {
  const hasSummary = !!document.summary

  const isInspection =
    document.reportType === 'inspection'

  const reportTitle = isInspection
    ? 'Inspection Report'
    : 'Completion Report'

  const summaryHeading = isInspection
    ? 'Inspection Findings'
    : 'Works Completed'

  const emptySummaryText = isInspection
    ? 'Draft an inspection summary to populate this section.'
    : 'Draft a completion summary to populate this section.'

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase font-bold text-slate-400">
            Report Preview
          </p>

          <h2 className="text-lg font-bold text-slate-900 mt-1">
            {reportTitle}
          </h2>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            hasSummary
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {hasSummary ? 'Ready' : 'Draft Required'}
        </span>
      </div>

      <div className="p-5">
        <div className="border border-slate-200 rounded-xl bg-white text-sm text-slate-800 overflow-hidden">
          <div className="p-5 border-b border-slate-200">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-wide">
              {reportTitle}
            </h1>

            <div className="mt-4 text-sm text-slate-700">
              <p className="font-bold text-slate-900">
                {document.property.address ||
                  'No address added'}
              </p>

              <div className="mt-3 space-y-1">
                {document.property.jobNumber && (
                  <p>
                    <span className="font-semibold">
                      Job Ref:
                    </span>{' '}
                    {document.property.jobNumber}
                  </p>
                )}

                {document.property.poNumber && (
                  <p>
                    <span className="font-semibold">
                      PO:
                    </span>{' '}
                    {document.property.poNumber}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="p-5 space-y-6">
            <section>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-2">
                {summaryHeading}
              </h2>

              {document.summary ? (
                <p className="whitespace-pre-wrap leading-relaxed">
                  {document.summary}
                </p>
              ) : (
                <p className="text-slate-400 italic">
                  {emptySummaryText}
                </p>
              )}
            </section>

            {!isInspection &&
              document.completion && (
                <section className="rounded-xl border border-green-200 bg-green-50 overflow-hidden">
                  <div className="border-b border-green-200 bg-green-100 px-4 py-3">
                    <h2 className="text-xs font-black uppercase tracking-wide text-green-800">
                      Completion Details
                    </h2>
                  </div>

                  <div className="p-4 space-y-4">
                    {document.completion
                      .organisation && (
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Completed By Organisation
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {
                            document
                              .completion
                              .organisation
                          }
                        </p>
                      </div>
                    )}

                    {document.completion
                      .completedBy && (
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Completed By
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {
                            document
                              .completion
                              .completedBy
                          }
                        </p>
                      </div>
                    )}

                    {document.completion
                      .completedAt && (
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Completion Date
                        </p>

                        <p className="mt-1 font-bold text-slate-900">
                          {new Date(
                            document.completion.completedAt
                          ).toLocaleString(
                            'en-GB'
                          )}
                        </p>
                      </div>
                    )}

                    {document.completion
                      .workCompleted && (
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Work Completed
                        </p>

                        <p className="mt-1 whitespace-pre-wrap leading-relaxed text-slate-700">
                          {
                            document
                              .completion
                              .workCompleted
                          }
                        </p>
                      </div>
                    )}

                    {document.completion
                      .signature && (
                      <div>
                        <p className="text-xs font-bold uppercase text-slate-400">
                          Signature
                        </p>

                        <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3">
                          <img
                            src={
                              document
                                .completion
                                .signature
                            }
                            alt="Completion signature"
                            className="max-h-28 w-auto"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

            {document.photos.length >
              0 && (
              <section>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide mb-3">
                  Photographic Evidence
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {document.photos.map(
                    (
                      photo: any,
                      index: number
                    ) => (
                      <div key={index}>
                        <img
                          src={photo.url}
                          alt={
                            photo.category ||
                            'Selected job photo'
                          }
                          className="w-full rounded-lg border border-slate-200"
                        />

                        {photo.category && (
                          <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                            {
                              photo.category
                            }
                          </p>
                        )}
                      </div>
                    )
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}