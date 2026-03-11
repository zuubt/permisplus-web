import { User, ChapterProgress, CoinTransaction, LeaderboardEntry, getStarsFromScore, getXpForLevel } from './types'

const USER_KEY = 'pp_user'
const PROGRESS_KEY = 'pp_progress'
const TX_KEY = 'pp_transactions'
const SYNC_KEY = 'pp_sync_queue'

// ─── Utilities ────────────────────────────────────────────────────────────────

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36)
}

export function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase()
}

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

// ─── User CRUD ────────────────────────────────────────────────────────────────

export function getUser(): User | null {
  return ls<User | null>(USER_KEY, null)
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
  age_range: User['age_range']
  vehicle_type: User['vehicle_type']
  avatar_initial: string
  referred_by?: string
}): User {
  const now = new Date().toISOString()
  const user: User = {
    id: generateId(),
    name: params.name,
    phone: params.phone,
    age_range: params.age_range,
    vehicle_type: params.vehicle_type,
    avatar_initial: params.avatar_initial,
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    last_active_date: null,
    completed_onboarding: true,
    referral_code: generateReferralCode(),
    referred_by: params.referred_by ?? null,
    daily_coin_earned: 0,
    daily_coin_date: null,
    is_guest: false,
    created_at: now,
  }
  saveUser(user)
  return user
}

export function createGuestUser(): User {
  const now = new Date().toISOString()
  const user: User = {
    id: generateId(),
    name: 'Invité',
    phone: '',
    age_range: '18-25',
    vehicle_type: 'car',
    avatar_initial: 'I',
    coins: 0,
    xp: 0,
    level: 1,
    streak: 0,
    last_active_date: null,
    completed_onboarding: true,
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

// ─── XP & Leveling ────────────────────────────────────────────────────────────

export function addXp(amount: number): User | null {
  const user = getUser()
  if (!user) return null
  user.xp += amount
  // level up: each level requires level * 200 cumulative XP
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

// ─── Coins ────────────────────────────────────────────────────────────────────

const DAILY_CAP = 100

export function addCoins(
  amount: number,
  type: CoinTransaction['type'],
  description: string
): User | null {
  const user = getUser()
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  let actual = amount

  if (type === 'earned') {
    const currentDate = user.daily_coin_date
    const earned = currentDate === today ? user.daily_coin_earned : 0
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

// ─── Streak ───────────────────────────────────────────────────────────────────

export function checkAndUpdateStreak(): { user: User; bonusCoins: number; levelledUp: boolean } {
  const user = getUser()
  if (!user) return { user: null as unknown as User, bonusCoins: 0, levelledUp: false }

  const today = new Date().toISOString().split('T')[0]
  if (user.last_active_date === today) return { user, bonusCoins: 0, levelledUp: false }

  const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0]
  user.streak = user.last_active_date === yesterday ? user.streak + 1 : 1
  user.last_active_date = today

  const prevLevel = user.level
  user.xp += 25 // daily first session bonus
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

// ─── Chapter Progress ─────────────────────────────────────────────────────────

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

  const xpBase = stars === 3 ? 150 : stars >= 1 ? 100 : 20
  const coinsBase = stars === 3 ? 50 : stars >= 1 ? 25 : 10

  // XP: only full amount if first time or improved
  const isImprovement = !prev || score > (prev.best_score ?? 0)
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
  addCoins(coinsEarned, 'earned', `Chapitre ${chapterId} complété`)
  addCoins(10, 'earned', 'Session terminée')

  addToSyncQueue({
    table: 'user_chapter_progress',
    data: { ...all[chapterId], user_id: user.id },
  })

  return { xp: xpEarned, coins: coinsEarned, stars }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export function getTransactions(): CoinTransaction[] {
  return ls<CoinTransaction[]>(TX_KEY, [])
}

function addTransaction(tx: CoinTransaction): void {
  const txs = getTransactions()
  txs.unshift(tx)
  lsSet(TX_KEY, txs.slice(0, 60))
}

// ─── Leaderboard (fake seed data + real user) ─────────────────────────────────

const FAKE_PLAYERS: LeaderboardEntry[] = [
  { id: 'l1', name: 'Kofi A.', avatar_initial: 'K', xp: 2450, level: 13, streak: 21 },
  { id: 'l2', name: 'Ama B.', avatar_initial: 'A', xp: 1980, level: 10, streak: 14 },
  { id: 'l3', name: 'Yaw C.', avatar_initial: 'Y', xp: 1520, level: 8, streak: 7 },
  { id: 'l4', name: 'Efua D.', avatar_initial: 'E', xp: 980, level: 5, streak: 3 },
  { id: 'l5', name: 'Kwame E.', avatar_initial: 'K', xp: 750, level: 4, streak: 5 },
]

export function getLeaderboard(): LeaderboardEntry[] {
  const user = getUser()
  const entries: LeaderboardEntry[] = [...FAKE_PLAYERS]
  if (user) {
    entries.push({
      id: user.id,
      name: user.name,
      avatar_initial: user.avatar_initial,
      xp: user.xp,
      level: user.level,
      streak: user.streak,
    })
  }
  return entries.sort((a, b) => b.xp - a.xp)
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────

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
