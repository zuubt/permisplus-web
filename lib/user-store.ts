import {
  ChapterProgress,
  CoinTransaction,
  RewardItem,
  User,
  VehicleType,
  getStarsFromScore,
  getXpForLevel,
} from './types'

const USER_KEY = 'pp_user'
const PROGRESS_KEY = 'pp_progress'
const TX_KEY = 'pp_transactions'
const SYNC_KEY = 'pp_sync_queue'

export const REWARDS: RewardItem[] = [
  { id: 'airtime-100', category: 'airtime', title: 'Mobile Airtime', subtitle: '100 FCFA top-up', coin_cost: 120 },
  { id: 'airtime-250', category: 'airtime', title: 'Mobile Airtime', subtitle: '250 FCFA top-up', coin_cost: 280 },
  { id: 'data-100', category: 'data', title: 'Data Bundle', subtitle: '100 MB package', coin_cost: 200 },
  { id: 'coupon-10', category: 'coupon', title: 'Discount Coupon', subtitle: '10% partner coupon', coin_cost: 350 },
  { id: 'premium-signs', category: 'premium', title: 'Premium Quiz Pack', subtitle: 'Advanced road signs set', coin_cost: 420 },
]

function ls<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function lsSet(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(value))
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

function normalizeVehicleType(value: unknown): VehicleType {
  if (value === 'motorcycle' || value === 'truck' || value === 'bus') return value
  return 'car'
}

function normalizeUser(raw: Record<string, unknown>): User {
  const ageValue = raw.age
  const legacyAgeRange = typeof raw.age_range === 'string' ? raw.age_range : null
  let age: number | null = typeof ageValue === 'number' ? ageValue : null

  if (age === null && legacyAgeRange) {
    if (legacyAgeRange === '16-18') age = 18
    else if (legacyAgeRange === '18-25') age = 22
    else if (legacyAgeRange === '25-35') age = 30
    else if (legacyAgeRange === '35+') age = 35
  }

  return {
    id: typeof raw.id === 'string' ? raw.id : generateId(),
    name: typeof raw.name === 'string' ? raw.name : 'Learner',
    phone: typeof raw.phone === 'string' ? raw.phone : '',
    country_code: typeof raw.country_code === 'string' ? raw.country_code : '+228',
    age,
    vehicle_type: normalizeVehicleType(raw.vehicle_type),
    coins: typeof raw.coins === 'number' ? raw.coins : 0,
    xp: typeof raw.xp === 'number' ? raw.xp : 0,
    level: typeof raw.level === 'number' ? raw.level : 1,
    streak: typeof raw.streak === 'number' ? raw.streak : 0,
    last_active_date: typeof raw.last_active_date === 'string' ? raw.last_active_date : null,
    completed_onboarding: Boolean(raw.completed_onboarding),
    daily_coin_earned: typeof raw.daily_coin_earned === 'number' ? raw.daily_coin_earned : 0,
    daily_coin_date: typeof raw.daily_coin_date === 'string' ? raw.daily_coin_date : null,
    created_at: typeof raw.created_at === 'string' ? raw.created_at : new Date().toISOString(),
  }
}

export function getUser(): User | null {
  const raw = ls<Record<string, unknown> | null>(USER_KEY, null)
  if (!raw) return null
  const normalized = normalizeUser(raw)
  if (JSON.stringify(raw) !== JSON.stringify(normalized)) {
    saveUser(normalized)
  }
  return normalized
}

export function saveUser(user: User): void {
  lsSet(USER_KEY, user)
}

export function clearUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(PROGRESS_KEY)
  localStorage.removeItem(TX_KEY)
}

export function createUser(params: {
  name: string
  phone: string
  country_code?: string
  age: number | null
  vehicle_type: VehicleType
}): User {
  const now = new Date().toISOString()
  const user: User = {
    id: generateId(),
    name: params.name.trim() || 'Learner',
    phone: params.phone,
    country_code: params.country_code ?? '+228',
    age: params.age,
    vehicle_type: params.vehicle_type,
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    last_active_date: null,
    completed_onboarding: true,
    daily_coin_earned: 0,
    daily_coin_date: null,
    created_at: now,
  }
  saveUser(user)
  return user
}

export function addXp(amount: number): User | null {
  const user = getUser()
  if (!user) return null
  user.xp += amount
  while (user.xp >= getXpForLevel(user.level + 1)) {
    user.level += 1
  }
  saveUser(user)
  return user
}

export function getXpProgress(user: User): { current: number; needed: number; pct: number } {
  const needed = getXpForLevel(user.level + 1)
  const prev = getXpForLevel(user.level)
  const current = user.xp - prev
  const range = needed - prev
  return {
    current,
    needed: range,
    pct: Math.min(100, Math.round((current / range) * 100)),
  }
}

const DAILY_CAP = 100

export function addCoins(amount: number, type: CoinTransaction['type'], description: string): User | null {
  const user = getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  let actual = amount

  if (type === 'earned') {
    const earned = user.daily_coin_date === today ? user.daily_coin_earned : 0
    if (earned >= DAILY_CAP) return user
    actual = Math.min(amount, DAILY_CAP - earned)
    user.daily_coin_earned = earned + actual
    user.daily_coin_date = today
  }

  user.coins = Math.max(0, user.coins + actual)
  saveUser(user)

  const tx: CoinTransaction = {
    id: generateId(),
    amount: actual,
    type,
    description,
    created_at: new Date().toISOString(),
  }
  addTransaction(tx)
  addToSyncQueue({ table: 'coin_transactions', data: { ...tx, user_id: user.id } })
  return user
}

export function spendCoins(amount: number, description: string): User | null {
  return addCoins(-amount, 'redeemed', description)
}

export function checkAndUpdateStreak(): { user: User; bonusCoins: number; levelledUp: boolean } {
  const user = getUser()
  if (!user) return { user: null as unknown as User, bonusCoins: 0, levelledUp: false }

  const today = new Date().toISOString().split('T')[0]
  if (user.last_active_date === today) return { user, bonusCoins: 0, levelledUp: false }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  user.streak = user.last_active_date === yesterday ? user.streak + 1 : 1
  user.last_active_date = today

  const prevLevel = user.level
  user.xp += 25
  while (user.xp >= getXpForLevel(user.level + 1)) user.level += 1
  const levelledUp = user.level > prevLevel

  let bonusCoins = 0
  if (user.streak === 7) bonusCoins = 30
  else if (user.streak === 14) bonusCoins = 60
  else if (user.streak === 30) bonusCoins = 150
  if (bonusCoins > 0) user.coins += bonusCoins

  saveUser(user)
  return { user, bonusCoins, levelledUp }
}

export function getAllChapterProgress(): Record<number, ChapterProgress> {
  return ls<Record<number, ChapterProgress>>(PROGRESS_KEY, {})
}

export function getChapterProgress(chapterId: number): ChapterProgress | null {
  return getAllChapterProgress()[chapterId] ?? null
}

export function saveChapterResult(
  chapterId: number,
  correctCount: number,
  totalCount: number
): { xp: number; coins: number; stars: 0 | 1 | 2 | 3 } {
  const user = getUser()
  if (!user) return { xp: 0, coins: 0, stars: 0 }

  const score = Math.round((correctCount / totalCount) * 100)
  const stars = getStarsFromScore(score)
  const all = getAllChapterProgress()
  const prev = all[chapterId]
  const isImprovement = !prev || score > (prev.best_score ?? 0)

  const xpBase = stars === 3 ? 150 : stars >= 1 ? 100 : 20
  const coinsBase = stars === 3 ? 50 : stars >= 1 ? 25 : 10
  const xpEarned = isImprovement ? xpBase : Math.round(xpBase * 0.3)
  const coinsEarned = isImprovement ? coinsBase : Math.round(coinsBase * 0.3)

  all[chapterId] = {
    chapter_id: chapterId,
    completed: score >= 80,
    best_score: Math.max(score, prev?.best_score ?? 0),
    stars: Math.max(stars, prev?.stars ?? 0) as 0 | 1 | 2 | 3,
    attempts: (prev?.attempts ?? 0) + 1,
    last_attempt_at: new Date().toISOString(),
  }
  lsSet(PROGRESS_KEY, all)

  addXp(xpEarned)
  addCoins(coinsEarned, 'earned', `Lesson ${chapterId} completed`)
  addToSyncQueue({
    table: 'user_chapter_progress',
    data: { ...all[chapterId], user_id: user.id },
  })

  return { xp: xpEarned, coins: coinsEarned, stars }
}

export function getTransactions(): CoinTransaction[] {
  return ls<CoinTransaction[]>(TX_KEY, [])
}

function addTransaction(tx: CoinTransaction): void {
  const txs = getTransactions()
  txs.unshift(tx)
  lsSet(TX_KEY, txs.slice(0, 60))
}

interface SyncItem {
  table: string
  data: Record<string, unknown>
}

export function addToSyncQueue(item: SyncItem): void {
  if (typeof window === 'undefined') return
  const q = ls<SyncItem[]>(SYNC_KEY, [])
  q.push(item)
  lsSet(SYNC_KEY, q)
}

export function getSyncQueue(): SyncItem[] {
  return ls<SyncItem[]>(SYNC_KEY, [])
}

export function clearSyncQueue(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(SYNC_KEY)
}
