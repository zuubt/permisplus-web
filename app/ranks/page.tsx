'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, getLeaderboard } from '@/lib/user-store'
import { User, LeaderboardEntry, getLevelTitle } from '@/lib/types'

export default function RanksPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/onboarding'); return }
    setUser(u)
    setLeaderboard(getLeaderboard())
  }, [router])

  if (!user) return null

  const userRank = leaderboard.findIndex(e => e.id === user.id) + 1

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-border px-5 pt-14 pb-5">
        <h1 className="text-2xl font-black text-text-primary">Classement</h1>
        <p className="text-text-secondary text-sm mt-1">Top apprenants de la semaine</p>
      </div>

      {/* User rank summary */}
      <div className="px-5 pt-4">
        <div className="bg-primary rounded-2xl p-4 text-white mb-5">
          <p className="text-white/80 text-xs font-semibold mb-1">Votre position</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-xl font-black">
              {user.avatar_initial}
            </div>
            <div>
              <p className="font-bold">{user.name}</p>
              <p className="text-white/80 text-sm">{getLevelTitle(user.level)} · {user.xp} XP</p>
            </div>
            <div className="ml-auto text-2xl font-black">#{userRank}</div>
          </div>
        </div>

        {/* Podium top 3 */}
        <div className="flex items-end justify-center gap-3 mb-6">
          {leaderboard.slice(0, 3).map((entry, idx) => {
            const height = idx === 0 ? 'h-20' : idx === 1 ? 'h-14' : 'h-10'
            const orderClass = idx === 0 ? 'order-2' : idx === 1 ? 'order-1' : 'order-3'
            const medals = ['🥇', '🥈', '🥉']
            return (
              <div key={entry.id} className={`flex flex-col items-center ${orderClass}`}>
                <div className="w-14 h-14 bg-primary-light rounded-full flex items-center justify-center text-xl font-black text-primary border-2 border-primary mb-1">
                  {entry.avatar_initial}
                </div>
                <p className="text-xs font-bold text-text-primary text-center truncate w-16">{entry.name.split(' ')[0]}</p>
                <p className="text-xs text-text-secondary">{entry.xp} XP</p>
                <div className={`${height} w-14 mt-1 rounded-t-xl flex items-center justify-center text-xl ${
                  idx === 0 ? 'bg-accent' : idx === 1 ? 'bg-gray-300' : 'bg-amber-600'
                }`}>
                  {medals[idx]}
                </div>
              </div>
            )
          })}
        </div>

        {/* Full list */}
        <div className="space-y-2 pb-6">
          {leaderboard.map((entry, idx) => {
            const isCurrentUser = entry.id === user.id
            const rank = idx + 1
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  isCurrentUser
                    ? 'border-primary bg-primary-light'
                    : 'border-border bg-white'
                }`}
              >
                <span className={`text-base font-black w-7 text-center ${
                  rank === 1 ? 'text-accent' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-text-disabled'
                }`}>
                  {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `#${rank}`}
                </span>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black ${
                  isCurrentUser ? 'bg-primary text-white' : 'bg-bg text-text-primary border border-border'
                }`}>
                  {entry.avatar_initial}
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isCurrentUser ? 'text-primary' : 'text-text-primary'}`}>
                    {entry.name} {isCurrentUser && '(vous)'}
                  </p>
                  <p className="text-xs text-text-secondary">{getLevelTitle(entry.level)}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isCurrentUser ? 'text-primary' : 'text-text-primary'}`}>
                    {entry.xp} XP
                  </p>
                  {entry.streak > 0 && (
                    <p className="text-xs text-text-secondary">🔥 {entry.streak}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
