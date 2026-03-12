'use client'

import Image from 'next/image'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/user-store'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const user = getUser()
      if (user?.completed_onboarding) {
        router.replace('/learn')
      } else {
        router.replace('/onboarding')
      }
    }, 900)

    return () => window.clearTimeout(timeout)
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3efee] px-6">
      <div className="w-full max-w-[360px] rounded-[32px] border border-white/70 bg-white/70 p-5 shadow-soft backdrop-blur">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-border bg-white shadow-card">
            <Image src="/logo.png" alt="PermisPlus logo" width={56} height={56} className="h-14 w-14 object-contain" />
          </div>
          <div>
            <h1 className="text-[32px] font-bold tracking-[-0.04em] text-text-primary">PermisPlus</h1>
            <p className="mt-1 text-base text-text-secondary">Preparation au permis pour adultes</p>
          </div>
        </div>

        <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
        </div>
      </div>
    </div>
  )
}
