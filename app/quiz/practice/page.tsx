'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS, MODULES } from '@/lib/seed-data'
import { Question } from '@/lib/types'
import { getUser, updateUserCoins, addTransaction, generateId } from '@/lib/user-store'
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react'

function PracticeQuiz() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const moduleId = searchParams.get('module') || 'all'

  const [questions] = useState<Question[]>(() => {
    const pool = moduleId === 'all' ? QUESTIONS : QUESTIONS.filter(q => q.module_id === moduleId)
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 15)
  })

  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const [showExplanation, setShowExplanation] = useState(false)
  const [done, setDone] = useState(false)
  const [rewarded, setRewarded] = useState(false)

  const question = questions[current]
  const options: { key: 'a' | 'b' | 'c' | 'd'; label: string }[] = [
    { key: 'a', label: question?.option_a },
    { key: 'b', label: question?.option_b },
    { key: 'c', label: question?.option_c },
    { key: 'd', label: question?.option_d },
  ]

  function handleSelect(key: 'a' | 'b' | 'c' | 'd') {
    if (selected) return
    setSelected(key)
    setShowExplanation(true)
    if (key === question.correct_option) setCorrect(c => c + 1)
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      setDone(true)
      if (!rewarded) {
        setRewarded(true)
        updateUserCoins(10, 'earned', 'Quiz entraînement terminé')
        addTransaction({ id: generateId(), amount: 10, type: 'earned', description: 'Quiz entraînement terminé', created_at: new Date().toISOString() })
      }
    } else {
      setCurrent(c => c + 1)
      setSelected(null)
      setShowExplanation(false)
    }
  }

  if (!question && !done) return null

  if (done) {
    const pct = Math.round((correct / questions.length) * 100)
    return (
      <div className="flex flex-col min-h-screen px-4 pt-10 pb-4 items-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4" style={{ background: pct >= 70 ? '#E8F5E9' : '#FFF3F3' }}>
          <span className="text-4xl">{pct >= 70 ? '🎉' : '📚'}</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{pct}%</h2>
        <p className="text-gray-500 mb-1">{correct} / {questions.length} correctes</p>
        <p className="text-primary font-medium text-sm mb-6">+10 pièces gagnées 🪙</p>
        <div className="bg-white rounded-2xl p-4 w-full mb-4 shadow-sm">
          <p className="text-sm text-gray-600 text-center">
            {pct >= 80 ? 'Excellent travail ! Tu maîtrises bien ce thème.' : pct >= 60 ? 'Bon travail ! Quelques révisions te permettront de progresser.' : 'Continue à pratiquer, tu vas y arriver !'}
          </p>
        </div>
        <div className="w-full space-y-3">
          <button onClick={() => router.push('/quiz')} className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold">
            Retour aux quiz
          </button>
          <button onClick={() => { setCurrent(0); setSelected(null); setShowExplanation(false); setCorrect(0); setDone(false) }} className="w-full bg-white text-primary border border-primary py-3.5 rounded-xl font-semibold">
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = selected === question.correct_option

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => router.back()} className="text-green-200 text-sm">← Quiz</button>
          <span className="text-green-200 text-sm">{current + 1} / {questions.length}</span>
        </div>
        <div className="bg-white/20 rounded-full h-1.5">
          <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <p className="font-semibold text-gray-800 text-base mb-5 leading-snug">{question.question_text}</p>

        <div className="space-y-3">
          {options.map(opt => {
            let btnClass = 'bg-white border-2 border-gray-100 text-gray-700'
            if (selected) {
              if (opt.key === question.correct_option) btnClass = 'bg-green-50 border-2 border-accent text-green-800'
              else if (opt.key === selected) btnClass = 'bg-red-50 border-2 border-red-400 text-red-700'
              else btnClass = 'bg-white border-2 border-gray-100 text-gray-400'
            }
            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                className={`w-full rounded-xl p-4 text-left flex items-center gap-3 transition-all ${btnClass}`}
              >
                <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold shrink-0 uppercase">{opt.key}</span>
                <span className="text-sm leading-snug">{opt.label}</span>
                {selected && opt.key === question.correct_option && <CheckCircle2 size={18} className="text-accent ml-auto shrink-0" />}
                {selected && opt.key === selected && opt.key !== question.correct_option && <XCircle size={18} className="text-red-400 ml-auto shrink-0" />}
              </button>
            )
          })}
        </div>

        <AnimatePresence>
          {showExplanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-4 rounded-xl ${isCorrect ? 'bg-green-50 border border-green-100' : 'bg-orange-50 border border-orange-100'}`}
            >
              <p className="text-xs font-bold mb-1 uppercase tracking-wide" style={{ color: isCorrect ? '#1A5C38' : '#EA580C' }}>
                {isCorrect ? '✓ Correct !' : '✗ Incorrect'}
              </p>
              <p className="text-sm text-gray-600">{question.explanation}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selected && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-bg">
          <button
            onClick={handleNext}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            {current + 1 >= questions.length ? 'Voir les résultats' : 'Question suivante'} <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <PracticeQuiz />
    </Suspense>
  )
}
