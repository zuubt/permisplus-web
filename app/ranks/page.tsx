'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RanksPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/progress')
  }, [router])

  return null
}
