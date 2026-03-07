'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getUser, checkAndUpdateStreak } from '@/lib/user-store'
import { MODULES, LESSONS, FAKE_LEADERBOARD } from '@/lib/seed-data'
import { User } from '@/lib/types'
import CoinCounter from '@/components/CoinCounter'
import Link from 'next/link'
import { BookOpen, Play, Trophy, Flame } from 'lucide-react'

function ReadinessRing({ percent }: { percent: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const offset = circ - (percent / 100) * circ

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" className="rotate-[-90deg]">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#E8F5E9" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r} fill="none"
          stroke="#1A5C38" strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-primary">{percent}%</span>
        <span className="text-[9px] text-gray-400 text-center leading-tight">Prêt</span>
      </div>
    </div>
  )
}

export default function AccueilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/auth'); return }
    setUser(u)

    const progress = JSON.parse(localStorage.getItem('permisplus_progress') || '[]')
    setCompletedLessons(progress)
  }, [router])

  if (!user) return null

  const totalLessons = LESSONS.length
  const readiness = Math.round((completedLessons.length / totalLessons) * 100)

  const allLeaderboard = [
    ...FAKE_LEADERBOARD,
    { id: user.id, name: user.name, coins_balance: user.coins_balance, streak_count: user.streak_count }
  ]
    .sort((a, b) => b.coins_balance - a.coins_balance)
    .slice(0, 3)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">Bonjour 👋</p>
          <h1 className="text-xl font-bold text-gray-800">{user.name}</h1>
        </div>
        <div className="bg-primary rounded-2xl px-4 py-2 flex items-center gap-2">
          <span className="text-yellow-300 text-lg">🪙</span>
          <span className="text-white font-bold text-lg">
            <CoinCounter value={user.coins_balance} />
          </span>
        </div>
      </div>

      {/* Streak + Readiness */}
      <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <ReadinessRing percent={readiness} />
        <div className="flex-1 space-y-3">
          <div>
            <p className="text-xs text-gray-400 mb-1">Score de préparation</p>
            <p className="text-sm text-gray-700 font-medium">{completedLessons.length} / {totalLessons} leçons</p>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              className="text-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔥
            </motion.span>
            <div>
              <p className="text-sm font-bold text-gray-800">{user.streak_count} jour{user.streak_count !== 1 ? 's' : ''}</p>
              <p className="text-xs text-gray-400">Série en cours</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/apprendre" className="bg-primary rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <p className="text-white font-semibold text-sm">Reprendre<br />la leçon</p>
        </Link>
        <Link href="/quiz?mode=mock" className="bg-accent rounded-2xl p-4 flex flex-col gap-2 active:scale-95 transition-transform">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Play size={20} className="text-white" />
          </div>
          <p className="text-white font-semibold text-sm">Examen<br />Blanc</p>
        </Link>
      </div>

      {/* Leaderboard preview */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" />
            <h2 className="font-bold text-gray-800">Classement</h2>
          </div>
          <Link href="/profil?tab=leaderboard" className="text-primary text-xs font-medium">Voir tout</Link>
        </div>
        <div className="space-y-2">
          {allLeaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2 rounded-xl ${entry.id === user.id ? 'bg-green-50 border border-green-100' : ''}`}
            >
              <span className="text-xl w-7 text-center">{medals[i] || `${i + 1}`}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-medium text-sm truncate ${entry.id === user.id ? 'text-primary' : 'text-gray-800'}`}>
                  {entry.name} {entry.id === user.id ? '(vous)' : ''}
                </p>
                <p className="text-xs text-gray-400">🔥 {entry.streak_count} jours</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-400">🪙</span>
                <span className="font-bold text-gray-700 text-sm">{entry.coins_balance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modules progress preview */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-800">Modules</h2>
          <Link href="/apprendre" className="text-primary text-xs font-medium">Tous les modules</Link>
        </div>
        <div className="space-y-2">
          {MODULES.slice(0, 3).map(mod => {
            const modLessons = LESSONS.filter(l => l.module_id === mod.id)
            const done = modLessons.filter(l => completedLessons.includes(l.id)).length
            const pct = modLessons.length > 0 ? Math.round((done / modLessons.length) * 100) : 0
            return (
              <div key={mod.id} className="flex items-center gap-3">
                <span className="text-xl">{mod.icon_emoji}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm text-gray-700 font-medium truncate pr-2">{mod.title_fr}</p>
                    <p className="text-xs text-gray-400 shrink-0">{done}/{modLessons.length}</p>
                  </div>
                  <div className="bg-gray-100 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
