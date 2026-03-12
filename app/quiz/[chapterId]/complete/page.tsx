'use client'

import { Suspense, use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowRight, Coins, Sparkles } from 'lucide-react'
import { CHAPTERS } from '@/lib/quiz-data'
import { saveChapterResult } from '@/lib/user-store'

function CompleteContent({ chapterId }: { chapterId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chapter = CHAPTERS.find(item => item.id === Number(chapterId))
  const score = Number(searchParams.get('score') ?? '0')
  const total = Number(searchParams.get('total') ?? '15')

  const [saved, setSaved] = useState(false)
  const [coins, setCoins] = useState(0)
  const [xp, setXp] = useState(0)

  useEffect(() => {
    if (saved) return
    setSaved(true)
    const result = saveChapterResult(Number(chapterId), score, total)
    setCoins(result.coins)
    setXp(result.xp)
  }, [chapterId, saved, score, total])

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="flex min-h-screen flex-col bg-bg px-5 pb-8 pt-8">
      <div className="surface-card rounded-[32px] p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary">
          <Sparkles size={26} />
        </div>
        <p className="mt-6 text-sm font-semibold text-text-secondary">Lecon terminee</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary">{chapter?.title}</h1>
        <p className="mt-3 text-sm leading-6 text-text-secondary">
          {percentage >= 80
            ? 'Vous avez termine cette lecon avec succes et debloque la suite.'
            : 'Vous pouvez ameliorer votre score en reprenant les questions ratees.'}
        </p>

        <div className="mt-6 grid grid-cols-3 gap-3 text-left">
          <div className="rounded-[24px] bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Score</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{percentage}%</p>
          </div>
          <div className="rounded-[24px] bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Pieces</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">+{coins}</p>
          </div>
          <div className="rounded-[24px] bg-bg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">XP</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">+{xp}</p>
          </div>
        </div>

        {percentage < 80 && (
          <div className="mt-5 rounded-[24px] bg-error-light px-4 py-4 text-left text-sm leading-6 text-error">
            Il faut au moins 80% de bonnes reponses pour valider la lecon. Reessayez pour la terminer correctement.
          </div>
        )}
      </div>

      <div className="mt-auto space-y-3">
        <button
          onClick={() => router.replace(percentage >= 80 ? '/learn' : `/quiz/${chapterId}`)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white"
        >
          {percentage >= 80 ? 'Continuer' : 'Reprendre la lecon'}
          <ArrowRight size={18} />
        </button>
        <button
          onClick={() => router.replace('/rewards')}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white px-4 py-4 text-base font-semibold text-text-primary"
        >
          <Coins size={18} />
          Voir les recompenses
        </button>
      </div>
    </div>
  )
}

export default function CompletePage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params)

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-bg">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <CompleteContent chapterId={chapterId} />
    </Suspense>
  )
}
