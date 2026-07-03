'use client'

import { useState } from 'react'
import PreviewPanel from '@/components/PreviewPanel'
import { buildCompletionDocument } from '@/lib/completionDocument'
import SummaryEditorModal from '@/components/SummaryEditorModal'
import ReportActionsPanel from '@/components/ReportActionsPanel'
import PhotoSelectorModal from '@/components/PhotoSelectorModal'
import BuilderSettingRow from '@/components/BuilderSettingRow'
import NoteSelectorModal from '@/components/NoteSelectorModal'

type DocumentComposerProps = {
  job: any
  notes: any[]
  photos: any[]
  scaffoldRecord: any
  asbestosRecord: any
  completionReport: any
}

export default function DocumentComposer({
  job,
  notes,
  photos,
  scaffoldRecord,
  asbestosRecord,
  completionReport,
}: DocumentComposerProps) {
  const generalNotes = notes.filter((note) => !note.internal_only)
  const internalNotes = notes.filter((note) => note.internal_only)

  const [includeDescription, setIncludeDescription] = useState(true)
  const [includeGeneralNotes, setIncludeGeneralNotes] = useState(true)
  const [includeInternalNotes, setIncludeInternalNotes] = useState(false)
  const [selectedPhotoIds, setSelectedPhotoIds] = useState(
    photos.map((photo) => photo.id)
  )
  const [includeScaffold, setIncludeScaffold] = useState(!!scaffoldRecord)
  const [includeAsbestos, setIncludeAsbestos] = useState(!!asbestosRecord)
  const [includeRams, setIncludeRams] = useState(false)

  const [summary, setSummary] = useState(completionReport?.summary || '')
  const [savedSummary, setSavedSummary] = useState(
  completionReport?.summary || ''
)
  const [draftSummary, setDraftSummary] = useState('')
  const [showSummaryModal, setShowSummaryModal] = useState(false)
  const [draftingSummary, setDraftingSummary] = useState(false)
  const [showPhotoSelector, setShowPhotoSelector] = useState(false)
  const [showGeneralNoteSelector, setShowGeneralNoteSelector] = useState(false)
  

const [selectedGeneralNoteIds, setSelectedGeneralNoteIds] = useState(
  generalNotes.map((note) => note.id)
)

const [showInternalNoteSelector, setShowInternalNoteSelector] = useState(false)

const [selectedInternalNoteIds, setSelectedInternalNoteIds] = useState(
  internalNotes.map((note) => note.id)
)
  const completionDocument = buildCompletionDocument({
    job,
    notes,
    photos,
    scaffoldRecord,
    asbestosRecord,
    options: {
      includeDescription,
      includeGeneralNotes,
      includeInternalNotes,
      includePhotos: selectedPhotoIds.length > 0,
      includeScaffold,
      includeAsbestos,
      selectedPhotoIds,
      selectedGeneralNoteIds,
      selectedInternalNoteIds,
    },
  })

  completionDocument.summary = summary

  function togglePhoto(photoId: string) {
    setSelectedPhotoIds((current) =>
      current.includes(photoId)
        ? current.filter((id) => id !== photoId)
        : [...current, photoId]
    )
  }

  function selectAllPhotos() {
    setSelectedPhotoIds(photos.map((photo) => photo.id))
  }

  function clearAllPhotos() {
    setSelectedPhotoIds([])
  }

function toggleGeneralNote(noteId: string) {
  setSelectedGeneralNoteIds((current) =>
    current.includes(noteId)
      ? current.filter((id) => id !== noteId)
      : [...current, noteId]
  )
}

function selectAllGeneralNotes() {
  setSelectedGeneralNoteIds(generalNotes.map((note) => note.id))
}

function clearAllGeneralNotes() {
  setSelectedGeneralNoteIds([])
}
function toggleInternalNote(noteId: string) {
  setSelectedInternalNoteIds((current) =>
    current.includes(noteId)
      ? current.filter((id) => id !== noteId)
      : [...current, noteId]
  )
}

function selectAllInternalNotes() {
  setSelectedInternalNoteIds(internalNotes.map((note) => note.id))
}

function clearAllInternalNotes() {
  setSelectedInternalNoteIds([])
}
  async function draftCompletionSummary(forceNew = false) {
    setDraftingSummary(true)

    if (summary && !forceNew) {
      setDraftSummary(summary)
      setShowSummaryModal(true)
      setDraftingSummary(false)
      return
    }

    const response = await fetch('/api/draft-completion-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(completionDocument),
    })

    const result = await response.json()

    if (!response.ok) {
      alert(result.error || 'Failed to draft summary')
      setDraftingSummary(false)
      return
    }

    setDraftSummary(result.summary)
    setShowSummaryModal(true)
    setDraftingSummary(false)
  }

  async function acceptSummary() {
    setSummary(draftSummary)
setSavedSummary(draftSummary)

    const response = await fetch('/api/save-completion-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        job_id: job.job_id,
        summary: draftSummary,
      }),
    })

    if (!response.ok) {
      const result = await response.json()
      alert(JSON.stringify(result.error, null, 2))
      return
    }

    setShowSummaryModal(false)
  }

async function createPdf() {
  const response = await fetch('/api/create-completion-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(completionDocument),
  })

  if (!response.ok) {
    alert('Failed to create PDF')
    return
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  const safeAddress =
  completionDocument.property.address
    ?.replace(/,/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase() || 'job'

link.download = `completion-report-${safeAddress}.pdf`
  link.click()

  window.URL.revokeObjectURL(url)
}

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-1">
          Create Report
        </h2>

        <p className="text-sm text-slate-500 mb-5">
          Choose what to include in the completion report.
        </p>

        <div className="grid gap-3">
          <p className="text-xs uppercase font-bold text-slate-400 mt-2">
            Job Information
          </p>

          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
            <p className="font-bold text-slate-900">
              Property & References
            </p>
            <p className="text-sm text-slate-500 mt-1">
              Always included.
            </p>
          </div>

          <p className="text-xs uppercase font-bold text-slate-400 mt-4">
            Work Information
          </p>

          <BuilderSettingRow
            title="Original Job Request"
            description={
              job?.description
                ? 'Include the original job description in additional information.'
                : 'No original job description has been added.'
            }
            checked={includeDescription}
            onChange={() => setIncludeDescription(!includeDescription)}
          />

         <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="font-bold text-slate-900">
        Supporting Notes
      </p>

      <p className="text-sm text-slate-500 mt-1">
        {generalNotes.length} note{generalNotes.length === 1 ? '' : 's'} available
      </p>

      <p className="text-sm text-slate-500">
        {selectedGeneralNoteIds.length} selected
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowGeneralNoteSelector(true)}
      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
    >
      Choose Notes →
    </button>
  </div>
</div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
  <div className="flex items-center justify-between gap-4">
    <div>
      <p className="font-bold text-slate-900">Internal Notes</p>

      <p className="text-sm text-slate-500 mt-1">
        {internalNotes.length} note{internalNotes.length === 1 ? '' : 's'} available
      </p>

      <p className="text-sm text-slate-500">
        {selectedInternalNoteIds.length} selected
      </p>
    </div>

    <button
      type="button"
      onClick={() => setShowInternalNoteSelector(true)}
      className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
    >
      Choose Notes →
    </button>
  </div>
</div>

          <p className="text-xs uppercase font-bold text-slate-400 mt-4">
            Evidence
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-bold text-slate-900">
                  Photographic Evidence
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  {photos.length} photograph{photos.length === 1 ? '' : 's'} available
                </p>

                <p className="text-sm text-slate-500">
                  {selectedPhotoIds.length} selected
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowPhotoSelector(true)}
                className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Choose Photographs →
              </button>
            </div>
          </div>

          <p className="text-xs uppercase font-bold text-slate-400 mt-4">
            Site Information
          </p>

          <BuilderSettingRow
            title="Access Arrangements"
            description={
              scaffoldRecord
                ? 'Include scaffold/access information in the report.'
                : 'No scaffold information recorded.'
            }
            checked={includeScaffold}
            onChange={() => setIncludeScaffold(!includeScaffold)}
          />

          <BuilderSettingRow
            title="Asbestos Information"
            description={
              asbestosRecord
                ? 'Include asbestos information where relevant.'
                : 'No asbestos information recorded.'
            }
            checked={includeAsbestos}
            onChange={() => setIncludeAsbestos(!includeAsbestos)}
          />

          <BuilderSettingRow
            title="RAMS"
            description="RAMS documents are not connected to completion reports yet."
            checked={includeRams}
            onChange={() => setIncludeRams(!includeRams)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <PreviewPanel document={completionDocument} />

        <ReportActionsPanel
  draftingSummary={draftingSummary}
  onDraftSummary={() => draftCompletionSummary(false)}
  onCreatePdf={createPdf}
  hasUnsavedChanges={summary !== savedSummary}
  report={{
    ...completionReport,
    summary,
  }}
/>

        {showPhotoSelector && (
          <PhotoSelectorModal
            photos={photos}
            selectedPhotoIds={selectedPhotoIds}
            onTogglePhoto={togglePhoto}
            onSelectAll={selectAllPhotos}
            onClearAll={clearAllPhotos}
            onClose={() => setShowPhotoSelector(false)}
          />
        )}

{showGeneralNoteSelector && (
  <NoteSelectorModal
    title="Choose Supporting Notes"
    notes={generalNotes}
    selectedNoteIds={selectedGeneralNoteIds}
    onToggleNote={toggleGeneralNote}
    onSelectAll={selectAllGeneralNotes}
    onClearAll={clearAllGeneralNotes}
    onClose={() => setShowGeneralNoteSelector(false)}
  />
)}

{showInternalNoteSelector && (
  <NoteSelectorModal
    title="Choose Internal Notes"
    notes={internalNotes}
    selectedNoteIds={selectedInternalNoteIds}
    onToggleNote={toggleInternalNote}
    onSelectAll={selectAllInternalNotes}
    onClearAll={clearAllInternalNotes}
    onClose={() => setShowInternalNoteSelector(false)}
  />
)}

        {showSummaryModal && (
          <SummaryEditorModal
            draftSummary={draftSummary}
            draftingSummary={draftingSummary}
            onChange={setDraftSummary}
            onCancel={() => setShowSummaryModal(false)}
            onRegenerate={() => draftCompletionSummary(true)}
            onAccept={acceptSummary}
          />
        )}
      </div>
    </div>
  )
}