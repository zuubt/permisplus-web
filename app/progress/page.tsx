'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart3, Coins, Gauge, Target, TrendingUp } from 'lucide-react'
import { CHAPTERS } from '@/lib/quiz-data'
import { getAllChapterProgress, getTransactions, getUser } from '@/lib/user-store'
import { ChapterProgress, User } from '@/lib/types'

export default function ProgressPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({})

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.replace('/onboarding')
      return
    }
    setUser(currentUser)
    setProgress(getAllChapterProgress())
  }, [router])

  const metrics = useMemo(() => {
    const entries = Object.values(progress)
    const completed = entries.filter(item => item.completed).length
    const totalAttempts = entries.reduce((sum, item) => sum + item.attempts, 0)
    const averageAccuracy = entries.length
      ? Math.round(entries.reduce((sum, item) => sum + item.best_score, 0) / entries.length)
      : 0
    const currentChapter = CHAPTERS.find(chapter => !progress[chapter.id]?.completed)?.title ?? 'Examen blanc'
    return { completed, totalAttempts, averageAccuracy, currentChapter }
  }, [progress])

  if (!user) return null

  return (
    <div className="min-h-screen px-5 pb-8 pt-8">
      <header className="surface-card rounded-[28px] p-5">
        <p className="text-sm font-semibold text-text-secondary">Progres</p>
        <h1 className="mt-1 text-3xl font-bold text-text-primary">Suivez votre progression</h1>
        <p className="mt-3 max-w-[32ch] text-sm leading-6 text-text-secondary">
          Une vue simple et claire pour comprendre rapidement vos resultats et vos points a renforcer.
        </p>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {[
          { icon: BarChart3, label: 'Lecons terminees', value: metrics.completed },
          { icon: Gauge, label: 'Precision', value: `${metrics.averageAccuracy}%` },
          { icon: Coins, label: 'Total des pieces', value: user.coins },
          { icon: TrendingUp, label: 'Serie actuelle', value: `${user.streak} jours` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="surface-card rounded-[24px] p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-bg text-text-secondary">
              <Icon size={18} />
            </div>
            <p className="mt-4 text-2xl font-bold text-text-primary">{value}</p>
            <p className="mt-1 text-sm text-text-secondary">{label}</p>
          </div>
        ))}
      </section>

      <section className="surface-card mt-5 rounded-[28px] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <Target size={20} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Chapitre actuel</p>
            <p className="text-sm text-text-secondary">{metrics.currentChapter}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4">
          {CHAPTERS.slice(0, 6).map(chapter => {
            const item = progress[chapter.id]
            const width = item ? Math.max(item.best_score, item.completed ? 100 : 12) : 8
            return (
              <div key={chapter.id}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-text-primary">{chapter.title}</span>
                  <span className="text-text-secondary">{item?.best_score ?? 0}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#ececec]">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="surface-card mt-5 rounded-[28px] p-5">
        <p className="font-semibold text-text-primary">Activite recente</p>
        <div className="mt-4 space-y-3">
          {getTransactions().slice(0, 4).map(item => (
            <div key={item.id} className="flex items-center justify-between rounded-2xl bg-bg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{item.description}</p>
                <p className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
              <span className={`text-sm font-semibold ${item.amount >= 0 ? 'text-success' : 'text-primary'}`}>
                {item.amount > 0 ? '+' : ''}
                {item.amount}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
