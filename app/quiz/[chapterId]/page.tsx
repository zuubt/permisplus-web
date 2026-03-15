'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Timer, Volume2, XCircle } from 'lucide-react'
import { CHAPTERS, getChapterQuizzes, shuffleArray } from '@/lib/quiz-data'
import { resolveQuizAsset } from '@/lib/media-assets'
import { speak, stopSpeech } from '@/lib/audio'
import { getUser } from '@/lib/user-store'
import { AnswerOutcome, getQuestionTimeLimit, QUIZ_TIMER_CONFIG, QuizPhase } from '@/lib/quiz-timers'
import { useQuizTimer } from '@/lib/use-quiz-timer'
import { QuizOption, QuizQuestion } from '@/lib/types'

export default function QuizPage({ params }: { params: { chapterId: string } }) {
  const { chapterId } = params
  const router = useRouter()
  const chapterIdNum = Number(chapterId)
  const chapter = CHAPTERS.find(item => item.id === chapterIdNum)
  const chapterTitle = toDisplayText(chapter?.title)
  const userLevel = getUser()?.level ?? 1

  const [quizzes, setQuizzes] = useState<QuizQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [correctCount, setCorrectCount] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [showConfirmExit, setShowConfirmExit] = useState(false)
  const [stepOrder, setStepOrder] = useState<QuizOption[]>([])
  const [retryQueue, setRetryQueue] = useState<QuizQuestion[]>([])
  const [phase, setPhase] = useState<QuizPhase>('question_active')
  const [answerOutcome, setAnswerOutcome] = useState<AnswerOutcome>(null)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [originalQuestionCount, setOriginalQuestionCount] = useState(0)

  const advanceTimeoutRef = useRef<number | null>(null)
  const hasAdvancedRef = useRef(false)

  useEffect(() => {
    const chapterQuizzes = shuffleArray(getChapterQuizzes(chapterIdNum)).slice(0, chapter?.quiz_count ?? 15)
    setQuizzes(chapterQuizzes)
    setOriginalQuestionCount(chapterQuizzes.length)
    setCurrentIdx(0)
    setRetryQueue([])
    setSelectedIds([])
    setPhase('question_active')
    setAnswerOutcome(null)
  }, [chapter?.quiz_count, chapterIdNum])

  const currentQuiz = quizzes[currentIdx]
  const questionAsset = resolveQuizAsset(currentQuiz?.image_key, currentQuiz?.question)
  const activeQuestionCount = originalQuestionCount || quizzes.length
  const progress = activeQuestionCount > 0 ? (currentIdx / activeQuestionCount) * 100 : 0
  const questionTimeLimit = currentQuiz ? getQuestionTimeLimit(currentQuiz, userLevel) : null

  const { timeRemaining, reset } = useQuizTimer({
    durationSec: questionTimeLimit,
    active: Boolean(currentQuiz) && phase === 'question_active',
    onTimeout: () => submitAnswer(true),
  })

  const isLowTime =
    phase === 'question_active' &&
    timeRemaining !== null &&
    timeRemaining <= QUIZ_TIMER_CONFIG.lowTimeThresholdSec

  const feedbackTone =
    answerOutcome === 'correct'
      ? 'Bonne reponse.'
      : answerOutcome === 'timeout'
        ? 'Temps ecoule.'
        : 'Mauvaise reponse.'

  const feedbackMessage =
    answerOutcome === 'timeout'
      ? `Temps ecoule. ${toDisplayText(currentQuiz?.explanation)}`
      : toDisplayText(currentQuiz?.explanation)

  useEffect(() => {
    if (!currentQuiz) return

    hasAdvancedRef.current = false
    setSelectedIds([])
    setPhase('question_active')
    setAnswerOutcome(null)
    setIsAudioPlaying(false)
    clearAdvanceTimeout()
    stopSpeech()
    reset(currentQuiz.type === 'step_ordering' ? getQuestionTimeLimit(currentQuiz, userLevel) : questionTimeLimit)

    if (currentQuiz.type === 'step_ordering') {
      setStepOrder(shuffleArray(currentQuiz.options))
    } else {
      setStepOrder([])
    }
  }, [currentQuiz?.id, questionTimeLimit, reset, userLevel])

  useEffect(() => {
    if (!currentQuiz || phase !== 'question_active') return
    playSpeechWithFallback(toDisplayText(currentQuiz.question), null)
    return () => stopSpeech()
  }, [currentQuiz?.id, phase])

  useEffect(() => {
    if (!currentQuiz || phase !== 'feedback_playing' || !answerOutcome) return
    playFeedbackAndAdvance(answerOutcome)
    return () => {
      setIsAudioPlaying(false)
      stopSpeech()
      clearAdvanceTimeout()
    }
  }, [answerOutcome, currentQuiz?.id, phase])

  useEffect(() => {
    return () => {
      stopSpeech()
      clearAdvanceTimeout()
    }
  }, [])

  if (!currentQuiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  function clearAdvanceTimeout() {
    if (advanceTimeoutRef.current !== null) {
      window.clearTimeout(advanceTimeoutRef.current)
      advanceTimeoutRef.current = null
    }
  }

  function handleSelect(optionId: string) {
    if (phase !== 'question_active') return
    if (currentQuiz.type === 'image_selection' || currentQuiz.type === 'word_image') {
      setSelectedIds(current =>
        current.includes(optionId) ? current.filter(item => item !== optionId) : [...current, optionId]
      )
      return
    }
    setSelectedIds([optionId])
  }

  function isAnswerCorrect(quiz: QuizQuestion, timedOut = false): boolean {
    if (timedOut) return false
    if (
      quiz.type === 'true_false' ||
      quiz.type === 'scenario' ||
      quiz.type === 'sign_recognition' ||
      quiz.type === 'object_id' ||
      quiz.type === 'hazard_detection'
    ) {
      return selectedIds.length === 1 && quiz.correct_ids.includes(selectedIds[0])
    }
    if (quiz.type === 'image_selection' || quiz.type === 'word_image') {
      return [...selectedIds].sort().join(',') === [...quiz.correct_ids].sort().join(',')
    }
    if (quiz.type === 'step_ordering') {
      return stepOrder.map(item => item.id).join(',') === quiz.correct_ids.join(',')
    }
    return false
  }

  function submitAnswer(timedOut = false) {
    if (!currentQuiz || phase !== 'question_active') return

    const isCorrect = isAnswerCorrect(currentQuiz, timedOut)
    const outcome: AnswerOutcome = timedOut ? 'timeout' : isCorrect ? 'correct' : 'incorrect'

    if (isCorrect) {
      setCorrectCount(value => value + 1)
      setXpEarned(value => value + 10)
    } else {
      setRetryQueue(current => {
        if (current.some(item => item.id === currentQuiz.id)) return current
        return [...current, currentQuiz]
      })
    }

    setAnswerOutcome(outcome)
    setPhase('feedback_playing')
  }

  function playSpeechWithFallback(text: string, fallbackMs: number | null, onFinish?: () => void) {
    if (!text) {
      if (fallbackMs !== null) {
        advanceTimeoutRef.current = window.setTimeout(() => onFinish?.(), fallbackMs)
      }
      return
    }

    setIsAudioPlaying(true)
    const started = speak(text, {
      onEnd: () => {
        setIsAudioPlaying(false)
        clearAdvanceTimeout()
        onFinish?.()
      },
      onError: () => {
        setIsAudioPlaying(false)
        clearAdvanceTimeout()
        if (fallbackMs !== null) {
          advanceTimeoutRef.current = window.setTimeout(() => onFinish?.(), fallbackMs)
        } else {
          onFinish?.()
        }
      },
    })

    if (!started && fallbackMs !== null) {
      setIsAudioPlaying(false)
      clearAdvanceTimeout()
      advanceTimeoutRef.current = window.setTimeout(() => onFinish?.(), getSpeechFallbackMs(text, fallbackMs))
    } else if (started && fallbackMs !== null) {
      clearAdvanceTimeout()
      advanceTimeoutRef.current = window.setTimeout(() => {
        setIsAudioPlaying(false)
        onFinish?.()
      }, getSpeechFallbackMs(text, fallbackMs))
    }
  }

  function playFeedbackAndAdvance(outcome: Exclude<AnswerOutcome, null>) {
    const fallbackMs =
      outcome === 'timeout'
        ? QUIZ_TIMER_CONFIG.fallbackAdvanceAfterTimeoutMs
        : QUIZ_TIMER_CONFIG.fallbackAdvanceAfterFeedbackMs

    playSpeechWithFallback(`${feedbackTone} ${toDisplayText(currentQuiz.explanation)}`, fallbackMs, () => {
      advanceToNextQuestionSafely()
    })
  }

  function advanceToNextQuestionSafely() {
    if (hasAdvancedRef.current) return
    hasAdvancedRef.current = true

    clearAdvanceTimeout()
    stopSpeech()
    setIsAudioPlaying(false)
    setPhase('transitioning')

    const isLastQuestion = currentIdx + 1 >= quizzes.length

    if (!isLastQuestion) {
      setCurrentIdx(value => value + 1)
      return
    }

    if (retryQueue.length > 0) {
      setQuizzes(retryQueue)
      setRetryQueue([])
      setCurrentIdx(0)
      return
    }

    router.replace(`/quiz/${chapterId}/complete?score=${correctCount}&total=${activeQuestionCount}&xp=${xpEarned}`)
  }

  function moveStep(direction: 'up' | 'down', index: number) {
    if (phase !== 'question_active') return
    const next = [...stepOrder]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    setStepOrder(next)
  }

  const canConfirm =
    phase === 'question_active' &&
    (currentQuiz.type === 'step_ordering' || currentQuiz.type === 'image_selection' || currentQuiz.type === 'word_image'
      ? selectedIds.length > 0 || currentQuiz.type === 'step_ordering'
      : selectedIds.length === 1)

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      {showConfirmExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6">
          <div className="w-full max-w-sm rounded-[28px] bg-white p-6 shadow-soft">
            <h2 className="text-xl font-bold text-text-primary">Quitter cette lecon ?</h2>
            <p className="mt-2 text-sm leading-6 text-text-secondary">Votre progression actuelle ne sera pas enregistree.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowConfirmExit(false)}
                className="rounded-2xl border border-border px-4 py-3 font-semibold text-text-primary"
              >
                Rester
              </button>
              <button
                onClick={() => {
                  stopSpeech()
                  router.replace('/learn')
                }}
                className="rounded-2xl bg-primary px-4 py-3 font-semibold text-white"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="border-b border-border bg-white px-5 pb-4 pt-8">
        <div className="mb-4 flex items-center gap-3">
          <button
            onClick={() => setShowConfirmExit(true)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-bg text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="space-y-2 flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-[#ececec]">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            {timeRemaining !== null && (
              <div className="flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                    isLowTime ? 'bg-error-light text-error' : 'bg-primary-light text-primary'
                  }`}
                >
                  <Timer size={14} />
                  <span>{timeRemaining}s</span>
                </div>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border ml-3">
                  <div
                    className={`h-full rounded-full transition-all ${isLowTime ? 'bg-error' : 'bg-primary'}`}
                    style={{
                      width: `${Math.max(0, Math.round(((timeRemaining ?? 0) / (questionTimeLimit ?? 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          <span className="text-sm font-semibold text-text-secondary">
            {Math.min(currentIdx + 1, activeQuestionCount)}/{activeQuestionCount}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Lecon</p>
            <p className="mt-1 text-base font-semibold text-text-primary">{chapterTitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">XP session</p>
            <p className="mt-1 text-base font-semibold text-text-primary">+{xpEarned}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-5">
        <section className="surface-card rounded-[28px] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Question</p>
              <h1 className="mt-2 text-2xl font-bold leading-tight text-text-primary">{toDisplayText(currentQuiz.question)}</h1>
            </div>
            <button
              onClick={() => playSpeechWithFallback(toDisplayText(currentQuiz.question), null)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-bg text-text-secondary"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {questionAsset && (
            <div className="mt-5 rounded-[24px] border border-dashed border-border bg-bg p-5">
              {!questionAsset.isMissing && questionAsset.src ? (
                <div className="relative min-h-40 overflow-hidden rounded-[20px] border border-border bg-white">
                  <Image
                    src={questionAsset.src}
                    alt={toDisplayText(currentQuiz.question)}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex min-h-40 items-center justify-center rounded-[20px] border border-border bg-white">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-text-primary">{questionAsset.alt}</p>
                    <p className="mt-1 text-xs text-text-secondary">Image reelle en attente</p>
                    {questionAsset.debugPath && (
                      <p className="mt-1 text-xs text-text-disabled">{questionAsset.debugPath}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-5">
            {currentQuiz.type === 'true_false' && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuiz.options.map(option => renderBinaryOption(option))}
              </div>
            )}

            {['scenario', 'sign_recognition', 'object_id', 'hazard_detection'].includes(currentQuiz.type) && (
              <div className="space-y-3">
                {currentQuiz.options.map(option => renderRowOption(option))}
              </div>
            )}

            {(currentQuiz.type === 'image_selection' || currentQuiz.type === 'word_image') && (
              <div className="grid grid-cols-2 gap-3">
                {currentQuiz.options.map(option => {
                  const selected = selectedIds.includes(option.id)
                  const correct = currentQuiz.correct_ids.includes(option.id)
                  const showState = phase !== 'question_active'
                  const optionAsset = resolveQuizAsset(option.image_key, option.text)
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelect(option.id)}
                      disabled={phase !== 'question_active'}
                      className={`rounded-[24px] border p-4 text-left transition-colors ${
                        getOptionCardClass({ selected, correct, showState })
                      }`}
                    >
                      {optionAsset && !optionAsset.isMissing && optionAsset.src ? (
                        <div className="overflow-hidden rounded-2xl border border-border bg-white">
                          <div className="relative h-28">
                            <Image
                              src={optionAsset.src}
                              alt={optionAsset.alt}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="px-3 py-3 text-center">
                            <p className="text-sm font-semibold text-text-primary">{toDisplayText(option.text)}</p>
                          </div>
                        </div>
                      ) : optionAsset ? (
                        <div className="rounded-2xl border border-dashed border-border bg-white px-3 py-6 text-center">
                          <p className="text-sm font-semibold text-text-primary">{toDisplayText(option.text) || optionAsset.alt}</p>
                          <p className="mt-1 text-xs text-text-secondary">Image reelle en attente</p>
                          {optionAsset.debugPath && (
                            <p className="mt-1 text-xs text-text-disabled">{optionAsset.debugPath}</p>
                          )}
                        </div>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )}

            {currentQuiz.type === 'step_ordering' && (
              <div className="space-y-3">
                {(phase !== 'question_active'
                  ? currentQuiz.correct_ids
                      .map(id => currentQuiz.options.find(option => option.id === id))
                      .filter(Boolean) as QuizOption[]
                  : stepOrder
                ).map((option, index) => (
                  <div key={option.id} className="rounded-[24px] border border-border bg-bg p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-text-primary">
                        {index + 1}
                      </div>
                      <p className="flex-1 text-sm font-semibold text-text-primary">{toDisplayText(option.text)}</p>
                      {phase === 'question_active' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => moveStep('up', index)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            onClick={() => moveStep('down', index)}
                            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-secondary"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white px-5 py-4">
        {phase === 'question_active' ? (
          <button
            disabled={!canConfirm}
            onClick={() => submitAnswer(false)}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Confirmer la reponse
          </button>
        ) : (
          <div className="space-y-4">
            <div
              className={`rounded-[24px] px-4 py-4 ${
                answerOutcome === 'correct' ? 'bg-success-light text-success' : 'bg-error-light text-error'
              }`}
            >
              <div className="flex items-start gap-3">
                {answerOutcome === 'correct' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                <div>
                  <p className="font-semibold">
                    {answerOutcome === 'correct'
                      ? 'Bonne reponse'
                      : answerOutcome === 'timeout'
                        ? 'Temps ecoule'
                        : 'Mauvaise reponse'}
                  </p>
                  <p className="mt-1 text-sm leading-6">{feedbackMessage}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-bg px-4 py-4 text-sm text-text-secondary">
              {isAudioPlaying ? 'Lecture de l\'explication... question suivante ensuite.' : 'Passage automatique a la question suivante...'}
            </div>
          </div>
        )}
      </footer>
    </div>
  )

  function renderBinaryOption(option: QuizOption) {
    const selected = selectedIds.includes(option.id)
    const correct = currentQuiz.correct_ids.includes(option.id)
    const showState = phase !== 'question_active'
    return (
      <button
        key={option.id}
        onClick={() => handleSelect(option.id)}
        disabled={phase !== 'question_active'}
        className={`rounded-[24px] border px-4 py-6 text-center text-base font-semibold transition-colors ${
          getOptionCardClass({ selected, correct, showState })
        }`}
      >
        {toDisplayText(option.text)}
      </button>
    )
  }

  function renderRowOption(option: QuizOption) {
    const selected = selectedIds.includes(option.id)
    const correct = currentQuiz.correct_ids.includes(option.id)
    const showState = phase !== 'question_active'
    return (
      <button
        key={option.id}
        onClick={() => handleSelect(option.id)}
        disabled={phase !== 'question_active'}
        className={`flex w-full items-center gap-3 rounded-[24px] border px-4 py-4 text-left transition-colors ${
          getOptionCardClass({ selected, correct, showState })
        }`}
      >
        {option.label && (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-semibold text-text-primary">
            {toDisplayText(option.label)}
          </div>
        )}
        <span className="flex-1 text-sm font-semibold text-text-primary">{toDisplayText(option.text)}</span>
      </button>
    )
  }
}

function toDisplayText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  if (Array.isArray(value)) {
    return value
      .map(item => toDisplayText(item))
      .filter(Boolean)
      .join(' ')
  }
  if (value && typeof value === 'object') {
    if ('text' in value && typeof value.text === 'string') return value.text
    if ('label' in value && typeof value.label === 'string') return value.label
  }
  return ''
}

function getSpeechFallbackMs(text: string, minimumMs: number): number {
  const estimatedSpeechMs = Math.max(2200, text.trim().split(/\s+/).length * 420)
  return Math.max(minimumMs, estimatedSpeechMs)
}

function getOptionCardClass({
  selected,
  correct,
  showState,
}: {
  selected: boolean
  correct: boolean
  showState: boolean
}) {
  if (showState) {
    if (correct) return 'border-success bg-success-light'
    if (selected) return 'border-error bg-error-light'
  }
  if (selected) return 'border-primary bg-primary-light'
  return 'border-border bg-white'
}
