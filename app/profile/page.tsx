'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, LogOut, Share2, Copy } from 'lucide-react'
import { getUser, getAllChapterProgress, clearUser, getTransactions, getXpProgress } from '@/lib/user-store'
import { CHAPTERS } from '@/lib/quiz-data'
import { User, ChapterProgress, getLevelTitle } from '@/lib/types'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [progress, setProgress] = useState<Record<number, ChapterProgress>>({})
  const [notificationsOn, setNotificationsOn] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)

  useEffect(() => {
    const u = getUser()
    if (!u) { router.replace('/onboarding'); return }
    setUser(u)
    setProgress(getAllChapterProgress())
    setNotificationsOn(localStorage.getItem('pp_notifications') === 'true')
  }, [router])

  if (!user) return null

  const xpInfo = getXpProgress(user)
  const masteredChapters = CHAPTERS.filter(c => (progress[c.id]?.best_score ?? 0) >= 80)
  const weakChapters = CHAPTERS.filter(c => (progress[c.id]?.attempts ?? 0) > 0 && (progress[c.id]?.best_score ?? 0) < 60)
  const totalCompleted = Object.values(progress).filter(p => p.completed).length
  const transactions = getTransactions().slice(0, 10)

  function handleCopyCode() {
    navigator.clipboard.writeText(user!.referral_code).catch(() => {})
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  function handleShareReferral() {
    const text = `Rejoins PermisPlus et prépare ton permis de conduire ! Utilise mon code : ${user!.referral_code}\n#PermisPlus #Togo`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
  }

  function handleLogout() {
    if (confirm('Déconnexion — êtes-vous sûr ?')) {
      clearUser()
      router.replace('/onboarding')
    }
  }

  function handleToggleNotifications() {
    const next = !notificationsOn
    if (next && 'Notification' in window) {
      Notification.requestPermission().then(p => {
        const granted = p === 'granted'
        setNotificationsOn(granted)
        localStorage.setItem('pp_notifications', String(granted))
      })
    } else {
      setNotificationsOn(next)
      localStorage.setItem('pp_notifications', String(next))
    }
  }

  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-white border-b border-border px-5 pt-14 pb-5">
        <h1 className="text-2xl font-black text-text-primary">Profil</h1>
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* User card */}
        <div className="bg-primary rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-black">
              {user.avatar_initial}
            </div>
            <div>
              <p className="text-xl font-black">{user.name}</p>
              <p className="text-white/80">{getLevelTitle(user.level)} · Niveau {user.level}</p>
              {user.phone && (
                <p className="text-white/60 text-sm">
                  {user.phone.slice(0, -4).replace(/./g, '•') + user.phone.slice(-4)}
                </p>
              )}
            </div>
          </div>

          {/* XP bar */}
          <div className="mb-1 flex justify-between text-sm text-white/80">
            <span>{xpInfo.current} XP</span>
            <span>{xpInfo.needed} XP</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all" style={{ width: `${xpInfo.pct}%` }} />
          </div>
          <p className="text-white/80 text-xs mt-1">Niveau {user.level + 1} dans {xpInfo.needed - xpInfo.current} XP</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'XP Total', value: user.xp, icon: '⚡' },
            { label: 'Niveau', value: user.level, icon: '🏅' },
            { label: 'Série max', value: `${user.streak} jours`, icon: '🔥' },
            { label: 'Chapitres', value: `${totalCompleted}/9`, icon: '📚' },
            { label: 'Pièces', value: user.coins, icon: '🪙' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-xl border border-border p-4">
              <p className="text-2xl mb-1">{icon}</p>
              <p className="text-xl font-black text-text-primary">{value}</p>
              <p className="text-xs text-text-secondary">{label}</p>
            </div>
          ))}
        </div>

        {/* Mastered chapters */}
        {masteredChapters.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="font-black text-text-primary mb-3">✅ Chapitres maîtrisés</p>
            <div className="flex flex-wrap gap-2">
              {masteredChapters.map(c => (
                <span key={c.id} className="flex items-center gap-1.5 bg-success-light text-success text-xs font-bold px-3 py-1.5 rounded-full">
                  {c.emoji} {c.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Weak chapters */}
        {weakChapters.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="font-black text-text-primary mb-3">💡 Points à améliorer</p>
            <div className="flex flex-wrap gap-2">
              {weakChapters.map(c => (
                <span key={c.id} className="flex items-center gap-1.5 bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                  {c.emoji} {c.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Referral */}
        <div className="bg-white rounded-2xl border border-border p-4">
          <p className="font-black text-text-primary mb-1">🎁 Code de parrainage</p>
          <p className="text-sm text-text-secondary mb-3">Invitez un ami et gagnez 100 pièces quand il complète son premier quiz</p>
          <div className="flex items-center gap-2 bg-bg rounded-xl px-4 py-3 border border-border mb-3">
            <span className="flex-1 font-black text-lg text-primary tracking-widest">{user.referral_code}</span>
            <button onClick={handleCopyCode} className="text-text-secondary">
              <Copy size={18} />
            </button>
          </div>
          {copiedCode && <p className="text-xs text-success mb-2 font-semibold">✓ Code copié !</p>}
          <button
            onClick={handleShareReferral}
            className="w-full flex items-center justify-center gap-2 bg-success text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
          >
            <Share2 size={16} />
            Partager sur WhatsApp
          </button>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <div className="bg-white rounded-2xl border border-border p-4">
            <p className="font-black text-text-primary mb-3">📊 Historique des pièces</p>
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{tx.description}</p>
                    <p className="text-xs text-text-disabled">
                      {new Date(tx.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-success' : 'text-primary'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} 🪙
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-border divide-y divide-border">
          <button
            onClick={handleToggleNotifications}
            className="w-full flex items-center gap-3 px-4 py-4"
          >
            {notificationsOn ? <Bell size={20} className="text-primary" /> : <BellOff size={20} className="text-text-disabled" />}
            <span className="flex-1 text-left font-semibold text-text-primary">Notifications</span>
            <span className={`text-xs font-bold ${notificationsOn ? 'text-success' : 'text-text-disabled'}`}>
              {notificationsOn ? 'Activées' : 'Désactivées'}
            </span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-4 text-primary"
          >
            <LogOut size={20} />
            <span className="font-semibold">Se déconnecter</span>
          </button>
        </div>

        <p className="text-center text-xs text-text-disabled pb-2">
          PermisPlus — MIAGROUP · Lomé, Togo
        </p>
      </div>
    </div>
  )
}
