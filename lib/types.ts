export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'bus'

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
  country_code: string
  age: number | null
  vehicle_type: VehicleType
  coins: number
  xp: number
  level: number
  streak: number
  last_active_date: string | null
  completed_onboarding: boolean
  daily_coin_earned: number
  daily_coin_date: string | null
  created_at: string
}

export interface Chapter {
  id: number
  title: string
  description: string
  quiz_count: number
  is_free: boolean
}

export interface ChapterProgress {
  chapter_id: number
  completed: boolean
  best_score: number
  stars: 0 | 1 | 2 | 3
  attempts: number
  last_attempt_at: string | null
}

export interface QuizOption {
  id: string
  text?: string
  image_key?: string
  label?: string
}

export interface QuizQuestion {
  id: string
  chapter_id: number
  type: QuizType
  question: string
  options: QuizOption[]
  correct_ids: string[]
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  image_key?: string
}

export interface QuizSessionResult {
  chapter_id: number
  answers: Record<string, string[]>
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

export interface RewardItem {
  id: string
  category: 'airtime' | 'data' | 'coupon' | 'premium'
  title: string
  subtitle: string
  coin_cost: number
}

export const LEVEL_TITLES: Record<string, string> = {
  '1': 'Debutant',
  '6': 'Apprenant',
  '16': 'Confiant',
  '31': 'Avance',
  '46': 'Pret pour la route',
}

export function getLevelTitle(level: number): string {
  if (level >= 46) return 'Pret pour la route'
  if (level >= 31) return 'Avance'
  if (level >= 16) return 'Confiant'
  if (level >= 6) return 'Apprenant'
  return 'Debutant'
}

export function getVehicleLabel(type: VehicleType): string {
  if (type === 'motorcycle') return 'Moto'
  if (type === 'truck') return 'Camion'
  if (type === 'bus') return 'Bus'
  return 'Voiture'
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

export function getInitials(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return 'P'
  return trimmed.slice(0, 1).toUpperCase()
}
