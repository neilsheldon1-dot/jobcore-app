'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'

type AutoRefreshProps = {
  intervalMs?: number
}

export default function AutoRefresh({
  intervalMs = 15000,
}: AutoRefreshProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const refreshingRef = useRef(false)

  function refreshPage() {
    if (
      document.visibilityState !== 'visible' ||
      refreshingRef.current
    ) {
      return
    }

    refreshingRef.current = true

    startTransition(() => {
      router.refresh()
    })

    window.setTimeout(() => {
      refreshingRef.current = false
    }, 1500)
  }

  useEffect(() => {
    const intervalId = window.setInterval(
      refreshPage,
      intervalMs
    )

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        refreshPage()
      }
    }

    function handleFocus() {
      refreshPage()
    }

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    )
    window.addEventListener('focus', handleFocus)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      )
      window.removeEventListener('focus', handleFocus)
    }
  }, [intervalMs])

  return null
}