'use client'

import {
  PointerEvent as ReactPointerEvent,
  useEffect,
  useRef,
  useState,
} from 'react'

type SignaturePadProps = {
  jobId: string
  recordId: string
  onComplete: () => void
  onBack?: () => void
  saveUrl?: string
}

export default function SignaturePad({
  jobId,
  recordId,
  onComplete,
  onBack,
  saveUrl = '/api/compliance/cannot-start-signature',
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    prepareCanvas()
  }, [])

  function prepareCanvas() {
    const canvas = canvasRef.current

    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const pixelRatio = window.devicePixelRatio || 1

    canvas.width = rect.width * pixelRatio
    canvas.height = rect.height * pixelRatio

    const context = canvas.getContext('2d')

    if (!context) return

    context.scale(pixelRatio, pixelRatio)
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.strokeStyle = '#0f172a'
  }

  function getCanvasPosition(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current

    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    }
  }

  function startDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current
    const position = getCanvasPosition(event)

    if (!canvas || !position) return

    const context = canvas.getContext('2d')

    if (!context) return

    canvas.setPointerCapture(event.pointerId)

    context.beginPath()
    context.moveTo(position.x, position.y)

    setIsDrawing(true)
    setHasSignature(true)
    setError('')
  }

  function draw(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return

    const canvas = canvasRef.current
    const position = getCanvasPosition(event)

    if (!canvas || !position) return

    const context = canvas.getContext('2d')

    if (!context) return

    context.lineTo(position.x, position.y)
    context.stroke()
  }

  function stopDrawing(
    event: ReactPointerEvent<HTMLCanvasElement>
  ) {
    const canvas = canvasRef.current

    if (canvas?.hasPointerCapture(event.pointerId)) {
      canvas.releasePointerCapture(event.pointerId)
    }

    setIsDrawing(false)
  }

  function clearSignature() {
    const canvas = canvasRef.current

    if (!canvas) return

    const context = canvas.getContext('2d')

    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)

    setHasSignature(false)
    setError('')
  }

  async function saveSignature() {
    if (!hasSignature) {
      setError('Please add a signature before continuing.')
      return
    }

    const canvas = canvasRef.current

    if (!canvas) {
      setError('The signature could not be read.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const signatureDataUrl = canvas.toDataURL('image/png')

      const response = await fetch(saveUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          recordId,
          signatureDataUrl,
        }),
      })

      const contentType =
        response.headers.get('content-type') || ''

      if (!contentType.includes('application/json')) {
        const text = await response.text()

        console.error(text)

        throw new Error(
          `Signature endpoint returned HTTP ${response.status}`
        )
      }

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error || 'The signature could not be saved.'
        )
      }

      onComplete()
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'The signature could not be saved.'
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <p className="text-sm text-slate-500">
        Please sign to complete this record.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border-2 border-slate-300 bg-white">
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={(event) => {
            if (isDrawing) {
              stopDrawing(event)
            }
          }}
          className="h-56 w-full touch-none cursor-crosshair"
        />
      </div>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={clearSignature}
          disabled={saving || !hasSignature}
          className="text-sm font-semibold text-slate-500 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear Signature
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-bold text-red-700">
            {error}
          </p>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={saveSignature}
          disabled={saving}
          className="w-full rounded-2xl bg-orange-500 px-6 py-4 text-lg font-black text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Sign and Complete'}
        </button>
      </div>

      {onBack && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="text-sm font-semibold text-slate-500 disabled:opacity-50"
          >
            ← Back
          </button>
        </div>
      )}
    </>
  )
}