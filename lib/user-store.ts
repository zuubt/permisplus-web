import { User } from './types'

const USER_KEY = 'permisplus_user'
const SYNC_QUEUE_KEY = 'permisplus_sync_queue'

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function generateReferralCode(): string {
  return Math.random().toString(36).substr(2, 6).toUpperCase()
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveUser(user: User): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}

export function createGuestUser(): User {
  const now = new Date().toISOString()
  const user: User = {
    id: generateId(),
    phone: '',
    name: 'Invité',
    city: 'Lomé',
    coins_balance: 0,
    streak_count: 0,
    last_active_date: null,
    referral_code: generateReferralCode(),
    referred_by: null,
    daily_coin_earned: 0,
    daily_coin_date: null,
    is_guest: true,
    created_at: now,
  }
  saveUser(user)
  return user
}

export function createOrGetUser(phone: string, name: string, city: string): User {
  const existing = getUserByPhone(phone)
  if (existing) {
    return existing
  }
  const now = new Date().toISOString()
  const user: User = {
    id: generateId(),
    phone,
    name,
    city,
    coins_balance: 0,
    streak_count: 0,
    last_active_date: null,
    referral_code: generateReferralCode(),
    referred_by: null,
    daily_coin_earned: 0,
    daily_coin_date: null,
    is_guest: false,
    created_at: now,
  }
  saveUser(user)
  return user
}

function getUserByPhone(phone: string): User | null {
  const user = getUser()
  if (user && user.phone === phone) return user
  return null
}

export function updateUserCoins(amount: number, type: 'earned' | 'redeemed' | 'bonus' | 'referral', description: string): User | null {
  const user = getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  const DAILY_CAP = 100

  if (type === 'earned') {
    const currentDate = user.daily_coin_date
    const currentEarned = currentDate === today ? user.daily_coin_earned : 0
    if (currentEarned >= DAILY_CAP) {
      return user // cap reached
    }
    const allowed = Math.min(amount, DAILY_CAP - currentEarned)
    user.daily_coin_earned = currentEarned + allowed
    user.daily_coin_date = today
    user.coins_balance = Math.max(0, user.coins_balance + allowed)
  } else {
    user.coins_balance = Math.max(0, user.coins_balance + amount)
  }

  const tx = {
    id: generateId(),
    user_id: user.id,
    amount,
    type,
    description,
    created_at: new Date().toISOString(),
  }
  addToSyncQueue({ table: 'coin_transactions', data: tx })
  saveUser(user)
  return user
}

export function checkAndUpdateStreak(): { user: User; bonusCoins: number } {
  const user = getUser()
  if (!user) return { user: null as unknown as User, bonusCoins: 0 }

  const today = new Date().toISOString().split('T')[0]
  const lastActive = user.last_active_date

  let bonusCoins = 0

  if (lastActive === today) {
    return { user, bonusCoins }
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  if (lastActive === yesterday) {
    user.streak_count += 1
  } else {
    user.streak_count = 1
  }

  user.last_active_date = today

  if (user.streak_count === 7) bonusCoins = 30
  else if (user.streak_count === 14) bonusCoins = 60
  else if (user.streak_count === 30) bonusCoins = 150

  if (bonusCoins > 0) {
    user.coins_balance += bonusCoins
    const tx = {
      id: generateId(),
      user_id: user.id,
      amount: bonusCoins,
      type: 'bonus',
      description: `Bonus série ${user.streak_count} jours`,
      created_at: new Date().toISOString(),
    }
    addToSyncQueue({ table: 'coin_transactions', data: tx })
  }

  saveUser(user)
  return { user, bonusCoins }
}

// Sync queue for offline writes
interface SyncItem {
  table: string
  data: Record<string, unknown>
}

export function addToSyncQueue(item: SyncItem): void {
  if (typeof window === 'undefined') return
  const queue = getSyncQueue()
  queue.push(item)
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue))
}

export function getSyncQueue(): SyncItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_QUEUE_KEY)
}

// Lesson progress
const PROGRESS_KEY = 'permisplus_progress'

export function getCompletedLessons(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function markLessonComplete(lessonId: string): void {
  const completed = getCompletedLessons()
  if (!completed.includes(lessonId)) {
    completed.push(lessonId)
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(completed))
  }
}

// Transaction history
const TX_KEY = 'permisplus_transactions'

export interface LocalTransaction {
  id: string
  amount: number
  type: 'earned' | 'redeemed' | 'bonus' | 'referral'
  description: string
  created_at: string
}

export function addTransaction(tx: LocalTransaction): void {
  if (typeof window === 'undefined') return
  const txs = getTransactions()
  txs.unshift(tx)
  localStorage.setItem(TX_KEY, JSON.stringify(txs.slice(0, 50)))
}

export function getTransactions(): LocalTransaction[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TX_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
