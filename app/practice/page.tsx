'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Clock, Zap } from 'lucide-react'
import { getUser } from '@/lib/user-store'
import { CHAPTERS } from '@/lib/quiz-data'
import { User } from '@/lib/types'

export default function PracticePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/onboarding'); return }
    setUser(u)
  }, [router])

  if (!user) return null

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-border px-5 pt-14 pb-5">
        <h1 className="text-2xl font-black text-text-primary">Pratique</h1>
        <p className="text-text-secondary text-sm mt-1">Entraînez-vous par chapitre ou passez l&apos;examen blanc</p>
      </div>

      <div className="px-5 py-5 space-y-4">
        {/* Mock Exam card */}
        <div className="bg-primary rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-1">Examen blanc</p>
              <h2 className="text-xl font-black">Simulation officielle</h2>
            </div>
            <span className="text-4xl">📋</span>
          </div>
          <div className="flex gap-4 mb-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Zap size={14} />40 questions</span>
            <span className="flex items-center gap-1"><Clock size={14} />30 minutes</span>
          </div>
          <button
            onClick={() => router.push('/quiz/9')}
            className="w-full bg-white text-primary py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Commencer l&apos;examen
          </button>
        </div>

        {/* Daily challenge */}
        <div className="bg-accent-light border-2 border-accent rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="font-black text-text-primary">Défi quotidien</p>
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-sm text-text-secondary mb-3">5 questions aléatoires · +50 XP bonus</p>
          <button
            onClick={() => router.push('/quiz/1')}
            className="w-full bg-accent text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            Relever le défi
          </button>
        </div>

        {/* Chapter selector */}
        <div>
          <h3 className="font-black text-text-primary mb-3">Pratiquer un chapitre</h3>
          <div className="space-y-2">
            {CHAPTERS.filter(c => c.id <= 8).map(chapter => (
              <button
                key={chapter.id}
                onClick={() => router.push(`/quiz/${chapter.id}`)}
                className="w-full flex items-center gap-3 bg-white rounded-xl border border-border px-4 py-3.5 active:scale-95 transition-transform"
              >
                <span className="text-2xl">{chapter.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-text-primary text-sm">{chapter.title}</p>
                  <p className="text-xs text-text-disabled">{chapter.quiz_count} quiz</p>
                </div>
                <ChevronRight size={18} className="text-text-disabled" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
