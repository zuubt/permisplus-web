'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Volume2, VolumeX } from 'lucide-react'
import { getUser, getAllChapterProgress, checkAndUpdateStreak, getXpProgress } from '@/lib/user-store'
import { CHAPTERS } from '@/lib/quiz-data'
import { User, ChapterProgress, getLevelTitle } from '@/lib/types'
import { isMuted, toggleMuted } from '@/lib/audio'

export default function MapPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({})
  const [muted, setMuted] = useState(false)
  const [showStreak, setShowStreak] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/onboarding'); return }
    const { user: updatedUser, bonusCoins } = checkAndUpdateStreak()
    setUser(updatedUser)
    setProgress(getAllChapterProgress())
    setMuted(isMuted())
    if (bonusCoins > 0) setShowStreak(true)
  }, [router])

  if (!user) return null

  const xpInfo = getXpProgress(user)

  function getChapterState(chapterId: number): 'locked' | 'active' | 'completed' {
    const prog = progress[chapterId]
    if (prog?.completed) return 'completed'
    // unlock first 3 free chapters + next one after completed
    if (chapterId <= 3) return prog ? 'active' : 'active'
    const prev = progress[chapterId - 1]
    if (prev?.completed) return 'active'
    return 'locked'
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-border px-5 pt-14 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">P+</span>
            </div>
            <span className="font-black text-text-primary text-lg">PermisPlus</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { const m = toggleMuted(); setMuted(m) }}
              className="text-text-secondary p-1"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div className="flex items-center gap-1.5 bg-accent-light px-3 py-1.5 rounded-full">
              <span className="text-accent text-sm font-bold">⚡</span>
              <span className="text-accent text-sm font-bold">{user.xp}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary-light px-3 py-1.5 rounded-full">
              <span className="text-sm">🪙</span>
              <span className="text-primary text-sm font-bold">{user.coins}</span>
            </div>
          </div>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.level}</span>
            </div>
            <span className="text-xs text-text-secondary font-medium">{getLevelTitle(user.level)}</span>
          </div>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${xpInfo.pct}%` }}
            />
          </div>
          <span className="text-xs text-text-disabled">{xpInfo.current}/{xpInfo.needed} XP</span>
        </div>

        {/* Streak */}
        {user.streak > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            <span className="text-base">🔥</span>
            <span className="text-sm font-bold text-text-primary">{user.streak} jour{user.streak > 1 ? 's' : ''} de suite</span>
          </div>
        )}
      </div>

      {/* Chapter Map */}
      <div className="px-6 py-6 space-y-3">
        <h2 className="text-lg font-black text-text-primary mb-4">Votre parcours</h2>

        {CHAPTERS.map((chapter, idx) => {
          const state = getChapterState(chapter.id)
          const prog = progress[chapter.id]
          const isLocked = state === 'locked'
          const isActive = state === 'active'
          const isCompleted = state === 'completed'

          return (
            <div key={chapter.id} className="relative">
              {/* Connector line */}
              {idx < CHAPTERS.length - 1 && (
                <div className={`absolute left-7 top-full w-0.5 h-3 z-0 ${
                  isCompleted ? 'bg-primary' : 'bg-border'
                }`} />
              )}

              <Link
                href={isLocked ? '#' : `/quiz/${chapter.id}`}
                className={`relative z-10 flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                  isLocked
                    ? 'border-border bg-white opacity-50 cursor-not-allowed'
                    : isActive
                    ? 'border-primary bg-white shadow-sm shadow-primary/20 cursor-pointer'
                    : 'border-success bg-success-light cursor-pointer'
                }`}
                onClick={e => isLocked && e.preventDefault()}
              >
                {/* Node circle */}
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-2xl font-black ${
                  isCompleted
                    ? 'bg-success text-white'
                    : isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-text-disabled'
                }`}>
                  {isLocked ? '🔒' : isCompleted ? '✓' : chapter.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-text-disabled uppercase tracking-wide">
                      Chapitre {chapter.id}
                    </span>
                    {isActive && (
                      <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        EN COURS
                      </span>
                    )}
                  </div>
                  <p className={`font-bold truncate ${
                    isLocked ? 'text-text-disabled' : 'text-text-primary'
                  }`}>
                    {chapter.title}
                  </p>
                  {isCompleted && prog && (
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} className={`text-sm ${i < prog.stars ? 'text-accent' : 'text-gray-200'}`}>★</span>
                      ))}
                      <span className="text-xs text-text-secondary ml-1">{prog.best_score}%</span>
                    </div>
                  )}
                  {isActive && !isCompleted && (
                    <p className="text-xs text-text-secondary mt-0.5">{chapter.quiz_count} quiz</p>
                  )}
                </div>

                {!isLocked && (
                  <div className={`shrink-0 text-sm ${isCompleted ? 'text-success' : 'text-primary'}`}>
                    {isCompleted ? '✓' : '→'}
                  </div>
                )}
              </Link>
            </div>
          )
        })}

        {/* Bottom padding */}
        <div className="h-4" />
      </div>

      {/* Daily Streak modal */}
      {showStreak && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-3xl w-full max-w-[430px] p-8 text-center">
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-2xl font-black text-text-primary">{user.streak} jour de suite !</h2>
            <p className="text-text-secondary mt-2 mb-6">Continuez demain pour maintenir votre série !</p>
            {/* Weekday tracker */}
            <div className="flex justify-center gap-3 mb-8">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => {
                const today = new Date().getDay()
                const dayIndex = i === 6 ? 0 : i + 1
                const isToday = dayIndex === today
                const isPast = i < (today === 0 ? 6 : today - 1)
                return (
                  <div key={i} className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                    isToday
                      ? 'border-primary bg-primary-light text-primary'
                      : isPast
                      ? 'border-success bg-success-light text-success'
                      : 'border-border text-text-disabled'
                  }`}>
                    {isToday ? '✓' : d}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setShowStreak(false)}
              className="w-full bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
            >
              Super !
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
