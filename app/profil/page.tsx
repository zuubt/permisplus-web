'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser, clearUser, getCompletedLessons } from '@/lib/user-store'
import { MODULES, LESSONS, QUESTIONS, FAKE_LEADERBOARD } from '@/lib/seed-data'
import { User } from '@/lib/types'
import { Bell, LogOut, Trophy, BookOpen, Target, ChevronRight } from 'lucide-react'

export default function ProfilPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [completedLessons, setCompletedLessons] = useState<string[]>([])
  const [leaderboardTab, setLeaderboardTab] = useState<'weekly' | 'alltime'>('weekly')
  const [notifEnabled, setNotifEnabled] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/auth'); return }
    setUser(u)
    setCompletedLessons(getCompletedLessons())
    const notif = localStorage.getItem('permisplus_notif') === 'true'
    setNotifEnabled(notif)
  }, [router])

  function handleNotifToggle() {
    const next = !notifEnabled
    setNotifEnabled(next)
    localStorage.setItem('permisplus_notif', String(next))
    if (next && 'Notification' in window) {
      Notification.requestPermission()
    }
  }

  function handleLogout() {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      clearUser()
      router.replace('/auth')
    }
  }

  if (!user) return null

  // Compute mastered and weak modules
  const masteredModules = MODULES.filter(mod => {
    const modLessons = LESSONS.filter(l => l.module_id === mod.id)
    return modLessons.length > 0 && modLessons.every(l => completedLessons.includes(l.id))
  })

  const weakModules = MODULES.filter(mod => {
    const modLessons = LESSONS.filter(l => l.module_id === mod.id)
    const done = modLessons.filter(l => completedLessons.includes(l.id)).length
    return modLessons.length > 0 && done < modLessons.length / 2
  })

  const allLeaderboard = [
    ...FAKE_LEADERBOARD,
    { id: user.id, name: user.name, coins_balance: user.coins_balance, streak_count: user.streak_count }
  ].sort((a, b) => b.coins_balance - a.coins_balance)

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Profile card */}
      <div className="bg-primary rounded-2xl p-5 flex items-center gap-4">
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
          {user.is_guest ? '👤' : user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h1 className="text-white font-bold text-lg">{user.name}</h1>
          {!user.is_guest && <p className="text-green-200 text-sm">{user.phone}</p>}
          {user.is_guest && <p className="text-green-200 text-sm italic">Mode invité</p>}
          <p className="text-green-200 text-xs">{user.city} · Code : {user.referral_code}</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <span className="text-2xl mb-1">🪙</span>
          <p className="text-xl font-bold text-gray-800">{user.coins_balance}</p>
          <p className="text-xs text-gray-400">Pièces totales</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <span className="text-2xl mb-1">🔥</span>
          <p className="text-xl font-bold text-gray-800">{user.streak_count}</p>
          <p className="text-xs text-gray-400">Jours de série</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <span className="text-2xl mb-1">📚</span>
          <p className="text-xl font-bold text-gray-800">{completedLessons.length}</p>
          <p className="text-xs text-gray-400">Leçons terminées</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center">
          <span className="text-2xl mb-1">✅</span>
          <p className="text-xl font-bold text-gray-800">{masteredModules.length}</p>
          <p className="text-xs text-gray-400">Modules maîtrisés</p>
        </div>
      </div>

      {/* Mastered modules */}
      {masteredModules.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={18} className="text-accent" />
            <h2 className="font-bold text-gray-800">Thèmes maîtrisés</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {masteredModules.map(mod => (
              <span key={mod.id} className="bg-green-50 text-primary text-xs font-medium px-3 py-1.5 rounded-full border border-green-100">
                {mod.icon_emoji} {mod.title_fr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Weak areas */}
      {weakModules.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={18} className="text-orange-400" />
            <h2 className="font-bold text-gray-800">Points à améliorer</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {weakModules.map(mod => (
              <span key={mod.id} className="bg-orange-50 text-orange-600 text-xs font-medium px-3 py-1.5 rounded-full border border-orange-100">
                {mod.icon_emoji} {mod.title_fr}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={18} className="text-yellow-500" />
          <h2 className="font-bold text-gray-800">Classement</h2>
        </div>
        <div className="flex gap-2 mb-3">
          {(['weekly', 'alltime'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setLeaderboardTab(tab)}
              className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${leaderboardTab === tab ? 'bg-primary text-white' : 'bg-gray-50 text-gray-500'}`}
            >
              {tab === 'weekly' ? 'Cette semaine' : 'Tout temps'}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {allLeaderboard.map((entry, i) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl ${entry.id === user.id ? 'bg-green-50 border border-green-100' : ''}`}
            >
              <span className="text-xl w-7 text-center">{medals[i] || `#${i + 1}`}</span>
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

      {/* Settings */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <h2 className="font-bold text-gray-800">Paramètres</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-gray-500" />
            <p className="text-sm text-gray-700">Notifications</p>
          </div>
          <button
            onClick={handleNotifToggle}
            className={`w-12 h-6 rounded-full transition-colors relative ${notifEnabled ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notifEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-red-500 w-full"
        >
          <LogOut size={18} />
          <p className="text-sm font-medium">Déconnexion</p>
        </button>
      </div>
    </div>
  )
}
