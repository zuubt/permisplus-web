'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export function useQuizTimer({
  durationSec,
  active,
  onTimeout,
}: {
  durationSec: number | null
  active: boolean
  onTimeout: () => void
}) {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(durationSec)
  const intervalRef = useRef<number | null>(null)
  const timeoutTriggeredRef = useRef(false)
  const timeoutCallbackRef = useRef(onTimeout)

  timeoutCallbackRef.current = onTimeout

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
  }, [clearTimer])

  const reset = useCallback(
    (nextDuration: number | null) => {
      clearTimer()
      timeoutTriggeredRef.current = false
      setTimeRemaining(nextDuration)
    },
    [clearTimer]
  )

  useEffect(() => {
    reset(durationSec)
  }, [durationSec, reset])

  useEffect(() => {
    clearTimer()

    if (!active || timeRemaining === null) return

    if (timeRemaining <= 0) {
      if (!timeoutTriggeredRef.current) {
        timeoutTriggeredRef.current = true
        timeoutCallbackRef.current()
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setTimeRemaining(current => {
        if (current === null) return null
        return current <= 1 ? 0 : current - 1
      })
    }, 1000)

    return clearTimer
  }, [active, clearTimer, timeRemaining])

  useEffect(() => clearTimer, [clearTimer])

  return {
    timeRemaining,
    stop,
    reset,
  }
}
