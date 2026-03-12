'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function PracticePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/rewards')
  }, [router])

  return null
}
