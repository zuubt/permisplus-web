'use client'

import { use, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Volume2, SkipForward } from 'lucide-react'
import { getChapterQuizzes, CHAPTERS, shuffleArray } from '@/lib/quiz-data'
import { QuizQuestion, QuizOption } from '@/lib/types'
import { speak, stopSpeech, isMuted } from '@/lib/audio'

type FeedbackState = 'idle' | 'correct' | 'incorrect'

export default function QuizPage({ params }: { params: Promise<{ chapterId: string }> }) {
  const { chapterId } = use(params)
  const router = useRouter()

  const chapterIdNum = parseInt(chapterId)
  const chapter = CHAPTERS.find(c => c.id === chapterIdNum)
  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [results, setResults] = useState<{ questionId: string; correct: boolean }[]>([])
  const [lives, setLives] = useState(3)
  const [xpEarned, setXpEarned] = useState(0)
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const [stepOrder, setStepOrder] = useState<QuizOption[]>([])
  const [timerLeft, setTimerLeft] = useState<number | null>(null)

  useEffect(() => {
    const qs = getChapterQuizzes(chapterIdNum)
    const shuffled = shuffleArray(qs).slice(0, chapter?.quiz_count ?? 15)
    setQuizzes(shuffled)
  }, [chapterIdNum, chapter])

  const currentQuiz = quizzes[currentIdx]
  const progress = quizzes.length > 0 ? ((currentIdx) / quizzes.length) * 100 : 0

  // Auto-speak question when it loads
  useEffect(() => {
    if (currentQuiz && feedback === 'idle') {
      speak(currentQuiz.question)
    }
    if (currentQuiz?.type === 'step_ordering') {
      setStepOrder(shuffleArray(currentQuiz.options))
    }
    // Hazard detection timer
    if (currentQuiz?.type === 'hazard_detection') {
      setTimerLeft(5)
    } else {
      setTimerLeft(null)
    }
  }, [currentQuiz, feedback])

  // Hazard detection countdown
  useEffect(() => {
    if (timerLeft === null || feedback !== 'idle') return
    if (timerLeft <= 0) {
      handleConfirm(true) // time ran out = incorrect
      return
    }
    const t = setTimeout(() => setTimerLeft(v => (v ?? 0) - 1), 1000)
    return () => clearTimeout(t)
  }, [timerLeft, feedback])

  function handleSelect(optionId: string) {
    if (feedback !== 'idle') return
    const quiz = currentQuiz
    if (!quiz) return

    if (quiz.type === 'image_selection' || quiz.type === 'word_image') {
      // Multi-select
      setSelectedIds(prev =>
        prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId]
      )
    } else {
      // Single select
      setSelectedIds([optionId])
    }
  }

  function handleConfirm(timedOut = false) {
    const quiz = currentQuiz
    if (!quiz) return

    const correct_ids = quiz.correct_ids
    let isCorrect = false

    if (timedOut) {
      isCorrect = false
    } else if (quiz.type === 'true_false' || quiz.type === 'scenario' || quiz.type === 'sign_recognition' || quiz.type === 'object_id' || quiz.type === 'hazard_detection') {
      isCorrect = selectedIds.length === 1 && correct_ids.includes(selectedIds[0])
    } else if (quiz.type === 'image_selection') {
      const sortedSel = [...selectedIds].sort()
      const sortedCorrect = [...correct_ids].sort()
      isCorrect = sortedSel.join(',') === sortedCorrect.join(',')
    } else if (quiz.type === 'step_ordering') {
      isCorrect = stepOrder.map(o => o.id).join(',') === correct_ids.join(',')
    }

    if (isCorrect) {
      setXpEarned(prev => prev + 10)
      speak('Correct !')
    } else {
      if (lives > 1) setLives(l => l - 1)
      speak(quiz.explanation)
    }

    setFeedback(isCorrect ? 'correct' : 'incorrect')
    setResults(prev => [...prev, { questionId: quiz.id, correct: isCorrect }])
  }

  function handleNext() {
    stopSpeech()
    setSelectedIds([])
    setFeedback('idle')

    if (currentIdx + 1 >= quizzes.length) {
      // Done — go to complete
      const correctCount = results.filter(r => r.correct).length + (feedback === 'correct' ? 0 : 0)
      const finalCorrect = results.filter(r => r.correct).length
      router.replace(`/quiz/${chapterId}/complete?score=${finalCorrect}&total=${quizzes.length}&xp=${xpEarned}`)
    } else {
      setCurrentIdx(i => i + 1)
    }
  }

  function moveStepUp(idx: number) {
    if (idx === 0) return
    const arr = [...stepOrder]
    ;[arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]]
    setStepOrder(arr)
  }

  function moveStepDown(idx: number) {
    if (idx === stepOrder.length - 1) return
    const arr = [...stepOrder]
    ;[arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]]
    setStepOrder(arr)
  }

  if (!currentQuiz) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const canConfirm = (() => {
    if (feedback !== 'idle') return false
    if (currentQuiz.type === 'step_ordering') return true
    if (currentQuiz.type === 'image_selection') return selectedIds.length > 0
    return selectedIds.length === 1
  })()

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Confirm exit dialog */}
      {showConfirmExit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-black text-text-primary mb-2">Quitter le quiz ?</h3>
            <p className="text-text-secondary text-sm mb-6">Votre progression pour ce chapitre ne sera pas sauvegardée.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="flex-1 py-3 rounded-xl border-2 border-border text-text-primary font-semibold"
              >
                Rester
              </button>
              <button
                onClick={() => { stopSpeech(); router.replace('/map') }}
                className="flex-1 py-3 rounded-xl bg-primary text-white font-semibold"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="px-4 pt-14 pb-3 bg-white border-b border-border">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setShowConfirmExit(true)} className="text-text-secondary p-1 -ml-1">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm font-bold text-text-secondary whitespace-nowrap">
            {currentIdx + 1}/{quizzes.length}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className={`text-lg ${i < lives ? 'text-primary' : 'text-gray-200'}`}>♥</span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {xpEarned > 0 && (
              <span className="text-accent text-sm font-bold">+{xpEarned} XP</span>
            )}
            <button onClick={() => speak(currentQuiz.question)} className="text-text-secondary p-1">
              <Volume2 size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-5 pt-5 pb-3">
          {chapter && (
            <p className="text-xs font-semibold text-text-disabled uppercase tracking-wide mb-2">
              {chapter.emoji} {chapter.title}
            </p>
          )}
          <h2 className="text-lg font-bold text-text-primary leading-snug">
            {currentQuiz.question}
          </h2>

          {/* Hazard timer */}
          {currentQuiz.type === 'hazard_detection' && timerLeft !== null && feedback === 'idle' && (
            <div className={`mt-2 text-2xl font-black ${timerLeft <= 2 ? 'text-primary' : 'text-text-primary'}`}>
              {timerLeft}s
            </div>
          )}
        </div>

        {/* Image for sign/object/hazard */}
        {currentQuiz.image_key && (
          <div className="px-5 mb-4">
            <div className="bg-bg rounded-2xl h-40 flex items-center justify-center border border-border">
              <span className="text-6xl">{getEmojiForImageKey(currentQuiz.image_key)}</span>
            </div>
          </div>
        )}

        <div className="px-5 pb-5">
          {/* TRUE/FALSE */}
          {currentQuiz.type === 'true_false' && (
            <div className="grid grid-cols-2 gap-3">
              {currentQuiz.options.map(opt => {
                const isSelected = selectedIds.includes(opt.id)
                const isCorrect = currentQuiz.correct_ids.includes(opt.id)
                const showResult = feedback !== 'idle'
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={feedback !== 'idle'}
                    className={`py-6 rounded-2xl font-bold text-base transition-all ${getOptionStyle(isSelected, isCorrect, showResult, opt.id === 'true')}`}
                  >
                    {opt.text}
                  </button>
                )
              })}
            </div>
          )}

          {/* SCENARIO / SIGN_RECOGNITION / OBJECT_ID / HAZARD */}
          {(['scenario', 'sign_recognition', 'object_id', 'hazard_detection'].includes(currentQuiz.type)) && (
            <div className="space-y-2.5">
              {currentQuiz.options.map(opt => {
                const isSelected = selectedIds.includes(opt.id)
                const isCorrect = currentQuiz.correct_ids.includes(opt.id)
                const showResult = feedback !== 'idle'
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelect(opt.id)}
                    disabled={feedback !== 'idle'}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 font-semibold text-left transition-all ${getOptionStyleRow(isSelected, isCorrect, showResult)}`}
                  >
                    {opt.label && (
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected ? 'bg-white/30' : 'bg-gray-100 text-text-secondary'
                      }`}>
                        {opt.label}
                      </span>
                    )}
                    <span className="flex-1">{opt.text}</span>
                    {showResult && isCorrect && <span className="text-success">✓</span>}
                    {showResult && isSelected && !isCorrect && <span className="text-primary">✗</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* IMAGE SELECTION (multi-select grid) */}
          {currentQuiz.type === 'image_selection' && (
            <div>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {currentQuiz.options.map(opt => {
                  const isSelected = selectedIds.includes(opt.id)
                  const isCorrect = currentQuiz.correct_ids.includes(opt.id)
                  const showResult = feedback !== 'idle'
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelect(opt.id)}
                      disabled={feedback !== 'idle'}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all p-2 ${
                        showResult
                          ? isCorrect
                            ? 'border-success bg-success-light'
                            : isSelected
                            ? 'border-primary bg-primary-light'
                            : 'border-border bg-bg'
                          : isSelected
                          ? 'border-primary bg-primary-light'
                          : 'border-border bg-bg'
                      }`}
                    >
                      <span className="text-3xl">{getEmojiForImageKey(opt.image_key ?? '')}</span>
                      <span className="text-xs font-semibold text-text-secondary text-center leading-tight">{opt.text}</span>
                    </button>
                  )
                })}
              </div>
              {selectedIds.length > 0 && feedback === 'idle' && (
                <p className="text-sm text-text-secondary text-center">
                  ✓ {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* STEP ORDERING */}
          {currentQuiz.type === 'step_ordering' && (
            <div className="space-y-2">
              {(feedback !== 'idle' ? currentQuiz.options.filter(o => currentQuiz.correct_ids.includes(o.id)).sort((a, b) => currentQuiz.correct_ids.indexOf(a.id) - currentQuiz.correct_ids.indexOf(b.id)) : stepOrder).map((step, idx) => {
                const correctPos = currentQuiz.correct_ids.indexOf(step.id)
                const isInCorrectPos = feedback !== 'idle' && correctPos === idx
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border-2 ${
                      feedback !== 'idle'
                        ? isInCorrectPos
                          ? 'border-success bg-success-light'
                          : 'border-primary bg-primary-light'
                        : 'border-border bg-bg'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      feedback !== 'idle'
                        ? isInCorrectPos ? 'bg-success text-white' : 'bg-primary text-white'
                        : 'bg-text-disabled/20 text-text-secondary'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-text-primary">{step.text}</span>
                    {feedback === 'idle' && (
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveStepUp(idx)} className="text-text-disabled text-xs leading-none p-1">▲</button>
                        <button onClick={() => moveStepDown(idx)} className="text-text-disabled text-xs leading-none p-1">▼</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Feedback panel */}
      {feedback !== 'idle' && (
        <div className={`px-5 py-5 ${feedback === 'correct' ? 'bg-success-light border-t-2 border-success' : 'bg-primary-light border-t-2 border-primary-border'}`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold ${
              feedback === 'correct' ? 'bg-success text-white' : 'bg-primary text-white'
            }`}>
              {feedback === 'correct' ? '✓' : '✗'}
            </div>
            <div>
              <p className={`font-black text-base ${feedback === 'correct' ? 'text-success' : 'text-primary'}`}>
                {feedback === 'correct' ? 'Correct !' : 'Incorrect'}
              </p>
              {feedback === 'correct' && (
                <span className="text-xs font-bold text-accent bg-accent-light px-2 py-0.5 rounded-full">+10 XP</span>
              )}
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{currentQuiz.explanation}</p>
        </div>
      )}

      {/* Bottom action */}
      <div className="px-5 py-4 bg-white border-t border-border">
        {feedback === 'idle' ? (
          <div className="flex gap-3">
            <button
              onClick={() => { stopSpeech(); handleNext() }}
              className="flex items-center gap-1 text-text-disabled px-4 py-4 rounded-xl border-2 border-border"
            >
              <SkipForward size={18} />
              <span className="text-sm font-semibold">Passer</span>
            </button>
            <button
              onClick={() => handleConfirm()}
              disabled={!canConfirm}
              className="flex-1 bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-40 active:scale-95 transition-transform"
            >
              Confirmer
            </button>
          </div>
        ) : (
          <button
            onClick={handleNext}
            className={`w-full py-4 rounded-xl font-bold active:scale-95 transition-transform ${
              feedback === 'correct' ? 'bg-success text-white' : 'bg-primary text-white'
            }`}
          >
            {currentIdx + 1 >= quizzes.length ? 'Voir les résultats' : 'Suivant →'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getOptionStyle(isSelected: boolean, isCorrect: boolean, showResult: boolean, _isTrueButton: boolean) {
  if (showResult) {
    if (isCorrect) return 'bg-success text-white border-2 border-success'
    if (isSelected) return 'bg-primary text-white border-2 border-primary'
    return 'bg-bg text-text-disabled border-2 border-border'
  }
  if (isSelected) return 'bg-primary text-white border-2 border-primary'
  return 'bg-bg text-text-primary border-2 border-border'
}

function getOptionStyleRow(isSelected: boolean, isCorrect: boolean, showResult: boolean) {
  if (showResult) {
    if (isCorrect) return 'border-success bg-success-light text-success'
    if (isSelected) return 'border-primary bg-primary-light text-primary'
    return 'border-border bg-white text-text-primary'
  }
  if (isSelected) return 'border-primary bg-primary-light text-primary'
  return 'border-border bg-white text-text-primary'
}

const IMAGE_EMOJI_MAP: Record<string, string> = {
  steering_wheel: '🔵', laptop: '💻', brake_pedal: '🟤', bicycle: '🚲',
  rearview_mirror: '🪟', phone: '📱', seatbelt: '🪢', warning_triangle: '⚠️',
  fire_extinguisher: '🧯', reflective_vest: '🦺', first_aid_kit: '🩹',
  spare_wheel: '🛞', warning_engine: '⚙️', warning_oil: '🛢️', warning_battery: '🔋',
  warning_temp: '🌡️', sign_stop: '🛑', sign_give_way: '🔺', sign_no_entry: '⛔',
  sign_speed_50: '5️⃣0️⃣', sign_pedestrian_crossing: '🚶', sign_no_overtaking: '🚫',
  hazard_pedestrian: '🚶‍♂️', clutch_pedal: '🔵', accelerator_pedal: '🟢',
}

function getEmojiForImageKey(key: string): string {
  return IMAGE_EMOJI_MAP[key] ?? '❓'
}
