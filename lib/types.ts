export interface User {
  id: string
  phone: string
  name: string
  city: string
  coins_balance: number
  streak_count: number
  last_active_date: string | null
  referral_code: string
  referred_by: string | null
  daily_coin_earned: number
  daily_coin_date: string | null
  is_guest: boolean
  created_at: string
}

export interface Module {
  id: string
  title_fr: string
  description_fr: string
  icon_emoji: string
  order_index: number
  is_active: boolean
}

export interface Lesson {
  id: string
  module_id: string
  title_fr: string
  content_json: LessonContent
  order_index: number
  coins_reward: number
}

export interface LessonContent {
  sections: { heading?: string; body: string }[]
}

export interface Question {
  id: string
  module_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_option: 'a' | 'b' | 'c' | 'd'
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export interface CoinTransaction {
  id: string
  user_id: string
  amount: number
  type: 'earned' | 'redeemed' | 'bonus' | 'referral'
  description: string
  created_at: string
}

export interface UserLessonProgress {
  lesson_id: string
  completed_at: string
}

export interface QuizSession {
  id: string
  user_id: string
  session_type: 'practice' | 'mock_exam'
  module_id: string | null
  score: number
  total_questions: number
  duration_seconds: number
  completed_at: string
}

export interface Redemption {
  id: string
  user_id: string
  coins_spent: number
  airtime_amount_fcfa: number
  operator: 'togocel' | 'moov'
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

export interface LeaderboardEntry {
  id: string
  name: string
  coins_balance: number
  streak_count: number
}
