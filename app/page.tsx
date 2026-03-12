'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/user-store'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user?.completed_onboarding) {
      router.replace('/learn')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
