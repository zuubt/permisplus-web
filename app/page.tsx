'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/user-store'

export default function RootRedirect() {
  const router = useRouter()

  useEffect(() => {
    const user = getUser()
    if (user && user.completed_onboarding) {
      router.replace('/map')
    } else {
      router.replace('/onboarding')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
