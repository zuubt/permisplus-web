'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Brain, Gift, User, WifiOff } from 'lucide-react'

const tabs = [
  { href: '/accueil', label: 'Accueil', icon: Home },
  { href: '/apprendre', label: 'Apprendre', icon: BookOpen },
  { href: '/quiz', label: 'Quiz', icon: Brain },
  { href: '/recompenses', label: 'Récompenses', icon: Gift },
  { href: '/profil', label: 'Profil', icon: User },
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
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
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs">
          <WifiOff size={14} />
          <span>Mode hors ligne — vos progrès seront synchronisés</span>
        </div>
      )}
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 safe-bottom z-50">
        <div className="flex">
          {tabs.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  active ? 'text-primary' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
