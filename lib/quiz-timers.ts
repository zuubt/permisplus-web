import { QuizQuestion, QuizType } from './types'

export type QuizPhase = 'question_active' | 'feedback_playing' | 'transitioning'
export type AnswerOutcome = 'correct' | 'incorrect' | 'timeout' | null

const QUESTION_TYPE_FALLBACKS: Partial<Record<QuizType, number>> = {
  hazard_detection: 8,
  sign_recognition: 12,
  step_ordering: 18,
}

export const QUIZ_TIMER_CONFIG = {
  questionDurationByDifficulty: {
    easy: 20,
    medium: 15,
    hard: 10,
  },
  lowTimeThresholdSec: 5,
  fallbackAdvanceAfterFeedbackMs: 1800,
  fallbackAdvanceAfterTimeoutMs: 2200,
  minimumQuestionDurationSec: 6,
} as const

export function getQuestionTimeLimit(question: QuizQuestion, userLevel: number): number {
  const explicitLimit = question.time_limit_sec
  const difficultyLimit = QUIZ_TIMER_CONFIG.questionDurationByDifficulty[question.difficulty]
  const typeLimit = QUESTION_TYPE_FALLBACKS[question.type]
  const baseLimit =
    explicitLimit ??
    difficultyLimit ??
    typeLimit ??
    QUIZ_TIMER_CONFIG.questionDurationByDifficulty.medium

  return Math.max(
    QUIZ_TIMER_CONFIG.minimumQuestionDurationSec,
    baseLimit - getLevelAdjustment(userLevel)
  )
}

function getLevelAdjustment(userLevel: number): number {
  if (userLevel >= 31) return 3
  if (userLevel >= 16) return 2
  if (userLevel >= 6) return 1
  return 0
}
