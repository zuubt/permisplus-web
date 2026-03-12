'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Gift, ChartColumnBig, UserRound, WifiOff } from 'lucide-react'
import { clearSyncQueue, getSyncQueue } from '@/lib/user-store'

const tabs = [
  { href: '/learn', label: 'Learn', icon: BookOpen },
  { href: '/rewards', label: 'Rewards', icon: Gift },
  { href: '/progress', label: 'Progress', icon: ChartColumnBig },
  { href: '/profile', label: 'Profile', icon: UserRound },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOnline() {
      setIsOnline(true)
      const queue = getSyncQueue()
      if (queue.length > 0) clearSyncQueue()
    }

    function handleOffline() {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      {!isOnline && (
        <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-700">
          <WifiOff size={14} />
          <span>You are offline. Progress will sync when your connection returns.</span>
        </div>
      )}

      <main className="flex-1 overflow-y-auto pb-24">{children}</main>

      <nav className="safe-bottom fixed bottom-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 border-t border-border bg-white/95 backdrop-blur">
        <div className="grid grid-cols-4">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`)
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1 px-2 py-3 text-center"
              >
                <div
                  className={`rounded-2xl px-3 py-2 transition-colors ${
                    active ? 'bg-primary-light text-primary' : 'text-text-secondary'
                  }`}
                >
                  <Icon size={18} strokeWidth={active ? 2.4 : 2} />
                </div>
                <span className={`text-[11px] font-semibold ${active ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
