'use client'

import { use, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { Share2 } from 'lucide-react'
import { CHAPTERS } from '@/lib/quiz-data'
import { saveChapterResult } from '@/lib/user-store'
import { getStarsFromScore } from '@/lib/types'

function CompleteContent({ chapterId }: { chapterId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const chapterIdNum = parseInt(chapterId)
  const chapter = CHAPTERS.find(c => c.id === chapterIdNum)

  const score = parseInt(searchParams.get('score') ?? '0')
  const total = parseInt(searchParams.get('total') ?? '15')
  const xpParam = parseInt(searchParams.get('xp') ?? '0')

  const [saved, setSaved] = useState(false)
  const [finalXp, setFinalXp] = useState(0)
  const [finalCoins, setFinalCoins] = useState(0)
  const [stars, setStars] = useState<0 | 1 | 2 | 3>(0)

  useEffect(() => {
    if (saved) return
    setSaved(true)
    const result = saveChapterResult(chapterIdNum, score, total)
    setFinalXp(result.xp)
    setFinalCoins(result.coins)
    setStars(result.stars)
  }, [chapterIdNum, score, total, saved])

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0
  const passed = percentage >= 80

  function handleShare() {
    const text = `J'ai complété "${chapter?.title}" sur PermisPlus avec ${percentage}% ! ${stars} étoile${stars !== 1 ? 's' : ''} ⭐\n#PermisPlus #Togo`
    if (navigator.share) {
      navigator.share({ title: 'PermisPlus', text }).catch(() => {})
    } else {
      const url = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(url, '_blank')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="px-6 pt-16 pb-6 text-center">
        <div className="text-7xl mb-4">🏆</div>
        <h1 className="text-2xl font-black text-text-primary">Chapitre terminé !</h1>
        <p className="text-text-secondary mt-1">
          Vous avez maîtrisé &quot;{chapter?.title}&quot;
        </p>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`text-4xl transition-transform ${i < stars ? 'text-accent scale-110' : 'text-gray-200'}`}>★</span>
        ))}
      </div>

      {/* Stats cards */}
      <div className="px-6 space-y-3 mb-8">
        <div className="flex items-center justify-between bg-bg rounded-xl px-5 py-4 border border-border">
          <span className="font-semibold text-text-secondary">Score</span>
          <span className={`text-lg font-black ${passed ? 'text-success' : 'text-primary'}`}>
            {percentage}%
          </span>
        </div>
        <div className="flex items-center justify-between bg-bg rounded-xl px-5 py-4 border border-border">
          <span className="font-semibold text-text-secondary">Bonnes réponses</span>
          <span className="text-lg font-black text-text-primary">{score}/{total}</span>
        </div>
        <div className="flex items-center justify-between bg-bg rounded-xl px-5 py-4 border border-border">
          <span className="font-semibold text-text-secondary">XP gagnés</span>
          <span className="text-lg font-black text-accent">⚡ +{finalXp}</span>
        </div>
        <div className="flex items-center justify-between bg-bg rounded-xl px-5 py-4 border border-border">
          <span className="font-semibold text-text-secondary">Pièces gagnées</span>
          <span className="text-lg font-black text-primary">🪙 +{finalCoins}</span>
        </div>
      </div>

      {/* Message based on score */}
      {!passed && (
        <div className="mx-6 bg-primary-light border border-primary-border rounded-xl p-4 mb-6">
          <p className="text-sm font-semibold text-primary">
            💡 Il faut 80% pour valider ce chapitre. Réessayez pour débloquer le suivant !
          </p>
        </div>
      )}

      <div className="px-6 space-y-3 mt-auto pb-8">
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-primary text-primary font-bold"
        >
          <Share2 size={18} />
          Partager sur WhatsApp
        </button>

        {!passed ? (
          <button
            onClick={() => router.replace(`/quiz/${chapterId}`)}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            Réessayer ce chapitre
          </button>
        ) : (
          <button
            onClick={() => router.replace('/map')}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold active:scale-95 transition-transform"
          >
            Continuer →
          </button>
        )}
      </div>
    </div>
  )
}

export default function CompletePage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params)
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CompleteContent chapterId={chapterId} />
    </Suspense>
  )
}
