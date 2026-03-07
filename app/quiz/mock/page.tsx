'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QUESTIONS } from '@/lib/seed-data'
import { Question } from '@/lib/types'
import { getUser, updateUserCoins, addTransaction, generateId } from '@/lib/user-store'
import { Clock, ChevronRight, Share2 } from 'lucide-react'

const MOCK_DURATION = 30 * 60 // 30 minutes in seconds

export default function MockExamPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<'ready' | 'exam' | 'results'>('ready')
  const [questions] = useState<Question[]>(() =>
    [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, 40)
  )
  const [answers, setAnswers] = useState<Record<string, 'a' | 'b' | 'c' | 'd'>>({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MOCK_DURATION)
  const [score, setScore] = useState(0)
  const [rewarded, setRewarded] = useState(false)
  const timerRef = useRef<NodeJS.Timeout>()
  const user = getUser()

  useEffect(() => {
    if (phase === 'exam') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current)
            finishExam()
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => clearInterval(timerRef.current)
  }, [phase])

  function finishExam() {
    clearInterval(timerRef.current)
    const correct = questions.filter(q => answers[q.id] === q.correct_option).length
    setScore(correct)
    setPhase('results')

    if (!rewarded) {
      setRewarded(true)
      const coins = correct === questions.length ? 75 : 25
      updateUserCoins(coins, 'earned', correct === questions.length ? 'Examen blanc parfait !' : 'Examen blanc terminé')
      addTransaction({ id: generateId(), amount: coins, type: 'earned', description: correct === questions.length ? 'Examen blanc parfait !' : 'Examen blanc terminé', created_at: new Date().toISOString() })
    }
  }

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  function handleAnswer(key: 'a' | 'b' | 'c' | 'd') {
    setAnswers(a => ({ ...a, [questions[current].id]: key }))
  }

  function handleNext() {
    if (current + 1 >= questions.length) {
      finishExam()
    } else {
      setCurrent(c => c + 1)
    }
  }

  async function handleShare() {
    const pct = Math.round((score / questions.length) * 100)
    const text = `Je viens de faire un Examen Blanc sur PermisPlus ! Score : ${score}/${questions.length} (${pct}%) 🚗\nPrépare ton permis de conduire aussi : permisplus.tg`
    if (navigator.share) {
      await navigator.share({ text })
    } else {
      await navigator.clipboard.writeText(text)
      alert('Résultat copié ! Partagez-le sur WhatsApp.')
    }
  }

  if (phase === 'ready') {
    return (
      <div className="flex flex-col min-h-screen px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="text-primary text-sm font-medium mb-6">← Quiz</button>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mb-5">
            <Clock size={36} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Examen Blanc</h1>
          <p className="text-gray-500 mb-6">40 questions · 30 minutes · Score minimum recommandé : 80%</p>
          <div className="bg-white rounded-2xl p-4 w-full mb-6 shadow-sm text-left space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-xl">📋</span>
              <p className="text-sm text-gray-600">40 questions tirées de tous les thèmes du code de la route</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">⏱</span>
              <p className="text-sm text-gray-600">30 minutes de temps imparti — comme l'examen officiel</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">🪙</span>
              <p className="text-sm text-gray-600">+25 pièces à la fin, +50 bonus si score parfait</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">📲</span>
              <p className="text-sm text-gray-600">Carte de score partageable sur WhatsApp</p>
            </div>
          </div>
          <button
            onClick={() => setPhase('exam')}
            className="w-full bg-primary text-white py-4 rounded-xl font-bold text-base active:scale-95 transition-transform"
          >
            Commencer l'examen
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'results') {
    const pct = Math.round((score / questions.length) * 100)
    const passed = pct >= 80
    const coins = score === questions.length ? 75 : 25

    return (
      <div className="px-4 pt-10 pb-4 min-h-screen">
        {/* Score card */}
        <div id="score-card" className={`rounded-3xl p-6 mb-5 text-center ${passed ? 'bg-primary' : 'bg-gray-700'}`}>
          <div className="text-4xl mb-3">{passed ? '🎉' : '📚'}</div>
          <h2 className="text-white text-2xl font-bold mb-1">{pct}%</h2>
          <p className="text-green-200 text-sm mb-3">{score} / {questions.length} correctes</p>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold mb-4 ${passed ? 'bg-white text-primary' : 'bg-red-100 text-red-700'}`}>
            {passed ? 'ADMIS ✓' : 'À AMÉLIORER'}
          </div>
          <p className="text-green-100 text-xs">PermisPlus · Togo · {new Date().toLocaleDateString('fr-FR')}</p>
          {user && <p className="text-white font-medium mt-1">{user.name}</p>}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Pièces gagnées</p>
            <p className="text-xs text-gray-400">{score === questions.length ? '+25 base +50 parfait' : ''}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-yellow-400 text-xl">🪙</span>
            <span className="text-xl font-bold text-gray-800">+{coins}</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-green-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <Share2 size={18} /> Partager sur WhatsApp
          </button>
          <button
            onClick={() => router.push('/quiz')}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Retour aux quiz
          </button>
          <button
            onClick={() => { setPhase('ready'); setAnswers({}); setCurrent(0); setTimeLeft(MOCK_DURATION); setScore(0); setRewarded(false) }}
            className="w-full bg-white text-primary border border-primary py-3.5 rounded-xl font-semibold active:scale-95 transition-transform"
          >
            Recommencer
          </button>
        </div>
      </div>
    )
  }

  // Exam phase
  const question = questions[current]
  const options: { key: 'a' | 'b' | 'c' | 'd'; label: string }[] = [
    { key: 'a', label: question.option_a },
    { key: 'b', label: question.option_b },
    { key: 'c', label: question.option_c },
    { key: 'd', label: question.option_d },
  ]
  const isLowTime = timeLeft < 300

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Timer header */}
      <div className={`px-4 pt-12 pb-4 ${isLowTime ? 'bg-red-600' : 'bg-primary'} transition-colors`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-green-200 text-sm">{current + 1} / {questions.length}</span>
          <div className={`flex items-center gap-2 font-mono font-bold ${isLowTime ? 'text-white animate-pulse' : 'text-white'}`}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
          <button onClick={finishExam} className="text-green-200 text-xs font-medium">Terminer</button>
        </div>
        <div className="bg-white/20 rounded-full h-1.5">
          <div className="bg-white h-1.5 rounded-full transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 px-4 py-5 overflow-y-auto">
        <p className="font-semibold text-gray-800 text-base mb-5 leading-snug">{question.question_text}</p>
        <div className="space-y-3">
          {options.map(opt => {
            const isSelected = answers[question.id] === opt.key
            return (
              <button
                key={opt.key}
                onClick={() => handleAnswer(opt.key)}
                className={`w-full rounded-xl p-4 text-left flex items-center gap-3 transition-all border-2 ${
                  isSelected ? 'bg-primary/10 border-primary' : 'bg-white border-gray-100'
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 uppercase ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {opt.key}
                </span>
                <span className="text-sm leading-snug text-gray-700">{opt.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-bg">
        <button
          onClick={handleNext}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {current + 1 >= questions.length ? 'Terminer l\'examen' : 'Question suivante'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  )
}
