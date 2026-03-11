export type AgeRange = '16-18' | '18-25' | '25-35' | '35+'
export type VehicleType = 'car' | 'motorcycle' | 'truck'
export type QuizType =
  | 'image_selection'
  | 'object_id'
  | 'word_image'
  | 'sign_recognition'
  | 'step_ordering'
  | 'scenario'
  | 'true_false'
  | 'hazard_detection'

export interface User {
  id: string
  name: string
  phone: string
  age_range: AgeRange
  vehicle_type: VehicleType
  avatar_initial: string
  coins: number
  xp: number
  level: number
  streak: number
  last_active_date: string | null
  completed_onboarding: boolean
  referral_code: string
  referred_by: string | null
  daily_coin_earned: number
  daily_coin_date: string | null
  is_guest: boolean
  created_at: string
}

export interface Chapter {
  id: number
  title: string
  emoji: string
  description: string
  quiz_count: number
  is_free: boolean
}

export interface ChapterProgress {
  chapter_id: number
  completed: boolean
  best_score: number  // 0–100
  stars: 0 | 1 | 2 | 3
  attempts: number
  last_attempt_at: string | null
}

export interface QuizOption {
  id: string
  text?: string
  image_key?: string  // key into public images map
  label?: string      // A, B, C, D
}

export interface QuizQuestion {
  id: string
  chapter_id: number
  type: QuizType
  question: string
  options: QuizOption[]
  correct_ids: string[]   // IDs of correct options (1 or more)
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  image_key?: string      // for object_id, hazard_detection, sign_recognition
  // for step_ordering: options are the steps, correct_ids is the ordered list
  // for word_image: options has both words and images, correct_ids are pairs encoded as "wordId:imageId"
  // for true_false: options are ['true','false'], correct_ids is ['true'] or ['false']
}

export interface QuizSessionResult {
  chapter_id: number
  answers: Record<string, string[]>  // questionId -> selected option ids
  correct_count: number
  total_count: number
  xp_earned: number
  coins_earned: number
  stars: 0 | 1 | 2 | 3
  completed_at: string
}

export interface CoinTransaction {
  id: string
  amount: number
  type: 'earned' | 'redeemed' | 'bonus' | 'referral'
  description: string
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  avatar_initial: string
  xp: number
  level: number
  streak: number
}

export const LEVEL_TITLES: Record<string, string> = {
  '1': 'Débutant',
  '6': 'Apprenti',
  '16': 'Confirmé',
  '31': 'Expert',
  '46': 'Maître du Code',
}

export function getLevelTitle(level: number): string {
  if (level >= 46) return 'Maître du Code'
  if (level >= 31) return 'Expert'
  if (level >= 16) return 'Confirmé'
  if (level >= 6) return 'Apprenti'
  return 'Débutant'
}

export function getXpForLevel(level: number): number {
  return level * 200
}

export function getStarsFromScore(score: number): 0 | 1 | 2 | 3 {
  if (score >= 100) return 3
  if (score >= 80) return 2
  if (score >= 60) return 1
  return 0
}
