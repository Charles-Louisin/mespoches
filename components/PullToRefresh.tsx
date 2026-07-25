'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { RefreshCw } from 'lucide-react'

const THRESHOLD = 72
const MAX_PULL = 110

interface PullToRefreshProps {
  children: React.ReactNode
}

export default function PullToRefresh({ children }: PullToRefreshProps) {
  const [native, setNative] = useState(false)
  const startY = useRef(0)
  const pulling = useRef(false)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    setNative(Capacitor.isNativePlatform())
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!native || refreshing) return
      if (window.scrollY > 4) return
      startY.current = e.touches[0].clientY
      pulling.current = true
    },
    [native, refreshing]
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!native || !pulling.current || refreshing) return
      const delta = e.touches[0].clientY - startY.current
      if (delta <= 0) {
        setPull(0)
        return
      }
      if (window.scrollY > 4) {
        pulling.current = false
        setPull(0)
        return
      }
      setPull(Math.min(delta * 0.45, MAX_PULL))
    },
    [native, refreshing]
  )

  const onTouchEnd = useCallback(() => {
    if (!native || !pulling.current) return
    pulling.current = false
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true)
      setPull(THRESHOLD)
      window.location.reload()
      return
    }
    setPull(0)
  }, [native, pull, refreshing])

  if (!native) {
    return <div className="contents">{children}</div>
  }

  const progress = Math.min(pull / THRESHOLD, 1)

  return (
    <div
      className="relative min-h-screen"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={onTouchEnd}
    >
      <div
        className="absolute left-0 right-0 z-[60] flex justify-center pointer-events-none transition-[height,opacity] duration-200 ease-out"
        style={{
          height: pull > 0 || refreshing ? Math.max(pull, refreshing ? THRESHOLD : 0) : 0,
          opacity: pull > 0 || refreshing ? 1 : 0,
          top: 0,
        }}
        aria-hidden
      >
        <div className="flex items-end justify-center pb-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-full bg-white shadow-md border border-gray-100 ${
              refreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: refreshing ? undefined : `rotate(${progress * 360}deg) scale(${0.7 + progress * 0.3})`,
            }}
          >
            <RefreshCw size={18} className="text-primary-600" />
          </div>
        </div>
      </div>

      <div
        className="transition-transform duration-200 ease-out"
        style={{ transform: pull > 0 ? `translateY(${pull}px)` : undefined }}
      >
        {children}
      </div>
    </div>
  )
}
