'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Flame, Lock, Volume2, VolumeX } from 'lucide-react'
import { CHAPTERS } from '@/lib/quiz-data'
import { ChapterProgress, User, getLevelTitle } from '@/lib/types'
import { checkAndUpdateStreak, getAllChapterProgress, getUser, getXpProgress } from '@/lib/user-store'
import { isMuted, toggleMuted } from '@/lib/audio'

export default function LearnPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({})
  const [muted, setMuted] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.replace('/onboarding')
      return
    }
    const { user: refreshedUser } = checkAndUpdateStreak()
    setUser(refreshedUser)
    setProgress(getAllChapterProgress())
    setMuted(isMuted())
  }, [router])

  if (!user) return null

  const xp = getXpProgress(user)

  function chapterState(chapterId: number): 'completed' | 'current' | 'locked' {
    const chapterProgress = progress[chapterId]
    if (chapterProgress?.completed) return 'completed'
    if (chapterId === 1) return 'current'
    return progress[chapterId - 1]?.completed ? 'current' : 'locked'
  }

  return (
    <div className="min-h-screen px-5 pb-8 pt-8">
      <header className="mb-6 rounded-[28px] border border-border bg-white px-5 py-5 shadow-card">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="surface-card flex h-12 w-12 items-center justify-center rounded-2xl">
              <Image src="/logo.png" alt="PermisPlus logo" width={28} height={28} />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-secondary">PermisPlus</p>
              <h1 className="text-2xl font-bold text-text-primary">Learn</h1>
            </div>
          </div>
          <button
            onClick={() => setMuted(toggleMuted())}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg text-text-secondary"
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Coins</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{user.coins}</p>
          </div>
          <div className="rounded-3xl bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Level</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{user.level}</p>
            <p className="text-xs text-text-secondary">{getLevelTitle(user.level)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-3xl bg-bg p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold text-text-primary">XP progress</p>
            <p className="text-sm text-text-secondary">{xp.current}/{xp.needed}</p>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ececec]">
            <div className="h-full rounded-full bg-primary" style={{ width: `${xp.pct}%` }} />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-text-secondary">
          <Flame size={16} className="text-primary" />
          <span>{user.streak} day streak</span>
        </div>
      </header>

      <section className="mb-5 rounded-[28px] border border-border bg-white p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-text-secondary">Current focus</p>
            <h2 className="text-xl font-bold text-text-primary">Structured lesson path</h2>
          </div>
          <div className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">
            80% to complete
          </div>
        </div>
        <p className="text-sm leading-6 text-text-secondary">
          Complete lessons in order. Missed questions come back before a lesson is marked complete.
        </p>
      </section>

      <div className="space-y-4">
        {CHAPTERS.map((chapter, index) => {
          const state = chapterState(chapter.id)
          const itemProgress = progress[chapter.id]
          const isLocked = state === 'locked'
          const isCompleted = state === 'completed'
          const isCurrent = state === 'current'

          return (
            <div key={chapter.id} className="relative">
              {index < CHAPTERS.length - 1 && (
                <div className={`absolute left-[23px] top-[72px] h-10 w-px ${isCompleted ? 'bg-[#bcbcbc]' : 'bg-border'}`} />
              )}
              <Link
                href={isLocked ? '#' : `/quiz/${chapter.id}`}
                onClick={event => isLocked && event.preventDefault()}
                className={`flex gap-4 rounded-[28px] border bg-white p-4 shadow-card transition-colors ${
                  isCurrent ? 'border-primary' : 'border-border'
                } ${isLocked ? 'opacity-70' : ''}`}
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border ${
                    isCompleted
                      ? 'border-[#d1d5db] bg-[#f3f4f6] text-text-primary'
                      : isCurrent
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-bg text-text-disabled'
                  }`}
                >
                  {isCompleted ? <Check size={20} /> : isLocked ? <Lock size={18} /> : <span className="font-semibold">{chapter.id}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="truncate text-base font-semibold text-text-primary">{chapter.title}</p>
                    <span className="text-xs font-medium text-text-secondary">{chapter.quiz_count} quizzes</span>
                  </div>
                  <p className="text-sm leading-6 text-text-secondary">{chapter.description}</p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-text-secondary">
                    {isCompleted && <span>Completed at {itemProgress?.best_score}%</span>}
                    {isCurrent && <span className="font-semibold text-primary">Current lesson</span>}
                    {isLocked && <span>Unlock previous lesson first</span>}
                  </div>
                </div>
              </Link>
            </div>
          )
        })}
      </div>
    </div>
  )
}
