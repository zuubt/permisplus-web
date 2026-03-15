'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Flame, Lock, Volume2, VolumeX } from 'lucide-react'
import { CHAPTERS } from '@/lib/quiz-data'
import { ChapterProgress, User, getLevelTitle } from '@/lib/types'
import { checkAndUpdateStreak, getAllChapterProgress, getUser, getXpProgress } from '@/lib/user-store'
import { isMuted, toggleMuted } from '@/lib/audio'

export default function LearnPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({})
  const [muted, setMuted] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.replace('/onboarding')
      setIsBootstrapping(false)
      return
    }
    const { user: refreshedUser } = checkAndUpdateStreak()
    setUser(refreshedUser)
    setProgress(getAllChapterProgress())
    setMuted(isMuted())
    setIsBootstrapping(false)
  }, [router])

  if (isBootstrapping || !user) {
    return (
      <div className="min-h-screen px-5 pb-8 pt-8">
        <div className="surface-card rounded-[28px] p-5">
          <p className="text-sm font-semibold text-text-secondary">Chargement</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">Preparation de votre parcours</h1>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-primary" />
          </div>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            Nous recuperons votre progression et vos chapitres.
          </p>
        </div>
      </div>
    )
  }

  const xp = getXpProgress(user)

  function chapterState(chapterId: number): 'completed' | 'current' | 'locked' {
    const chapterProgress = progress[chapterId]
    if (chapterProgress?.completed) return 'completed'
    if (chapterId === 1) return 'current'
    return progress[chapterId - 1]?.completed ? 'current' : 'locked'
  }

  return (
    <div className="min-h-screen px-5 pb-8 pt-8">
      <header className="mb-6">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text-primary shadow-card">
              <ArrowLeft size={18} />
            </button>
            <div>
              <p className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Parcours</p>
            </div>
          </div>
          <div className="rounded-full bg-accent-light px-3 py-2 text-[11px] font-semibold tracking-[0.18em] text-accent">
            SERIE DE {user.streak} JOURS
          </div>
        </div>

        <div className="surface-card rounded-[28px] p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-secondary">Progression</p>
          <p className="mt-2 text-xl font-semibold text-text-primary">
            {Object.values(progress).filter(item => item.completed).length} chapitres termines sur {CHAPTERS.length}
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-success"
              style={{ width: `${Math.round((Object.values(progress).filter(item => item.completed).length / CHAPTERS.length) * 100)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Suivant : {CHAPTERS.find(chapter => !progress[chapter.id]?.completed)?.title ?? 'Examen blanc'}
            </span>
            <span className="font-semibold text-success">{xp.pct}% du niveau</span>
          </div>
          <div className="mt-4 grid grid-cols-[1fr_1fr_auto] gap-3">
            <div className="rounded-[20px] bg-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Pieces</p>
              <p className="mt-2 text-xl font-semibold text-text-primary">{user.coins}</p>
            </div>
            <div className="rounded-[20px] bg-bg p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Niveau</p>
              <p className="mt-2 text-xl font-semibold text-text-primary">{user.level}</p>
              <p className="text-xs text-text-secondary">{getLevelTitle(user.level)}</p>
            </div>
            <button
              onClick={() => setMuted(toggleMuted())}
              className="flex w-14 items-center justify-center rounded-[20px] bg-bg text-text-secondary"
            >
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </header>

      <section className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">Vos chapitres</h2>
        <div className="rounded-full border border-border bg-white px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-text-secondary">
          VUE PARCOURS
        </div>
      </section>

      <div className="space-y-4">
        {CHAPTERS.map(chapter => {
          const state = chapterState(chapter.id)
          const itemProgress = progress[chapter.id]
          const isLocked = state === 'locked'
          const isCompleted = state === 'completed'
          const isCurrent = state === 'current'

          return (
            <Link
              key={chapter.id}
              href={isLocked ? '#' : `/quiz/${chapter.id}`}
              onClick={event => isLocked && event.preventDefault()}
              className="surface-card flex items-center justify-between rounded-[24px] px-4 py-4"
            >
              <div className="min-w-0">
                <p className={`truncate text-base font-medium ${isLocked ? 'text-text-secondary' : 'text-text-primary'}`}>
                  Chapitre {chapter.id} · {chapter.title}
                </p>
                <p className="mt-1 text-sm text-text-secondary">{chapter.description}</p>
              </div>
              <div className="ml-4 shrink-0">
                {isCompleted && <span className="text-[11px] font-semibold tracking-[0.18em] text-success">TERMINE</span>}
                {isCurrent && <span className="text-[11px] font-semibold tracking-[0.18em] text-accent">EN COURS</span>}
                {isLocked && <span className="text-[11px] font-semibold tracking-[0.18em] text-text-disabled">BLOQUE</span>}
              </div>
            </Link>
          )
        })}
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-text-secondary">
        <Flame size={16} className="text-primary" />
        <span>{user.streak} jours consecutifs actifs</span>
      </div>
    </div>
  )
}
