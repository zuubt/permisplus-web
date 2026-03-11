'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Dumbbell, Trophy, User, WifiOff } from 'lucide-react'
import { getSyncQueue, clearSyncQueue } from '@/lib/user-store'

const tabs = [
  { href: '/map', label: 'Parcours', icon: Map },
  { href: '/practice', label: 'Pratique', icon: Dumbbell },
  { href: '/ranks', label: 'Classement', icon: Trophy },
  { href: '/profile', label: 'Profil', icon: User },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    function handleOnline() {
      setIsOnline(true)
      // Flush sync queue when back online
      const queue = getSyncQueue()
      if (queue.length > 0) {
        // In a real app, upsert to Supabase here
        clearSyncQueue()
      }
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
    <div className="flex flex-col min-h-screen">
      {!isOnline && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs z-50">
          <WifiOff size={14} />
          <span>Mode hors ligne — vos progrès seront synchronisés</span>
        </div>
      )}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-border safe-bottom z-50">
        <div className="flex">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2.5 gap-1 transition-colors ${
                  active ? 'text-primary' : 'text-text-disabled'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
