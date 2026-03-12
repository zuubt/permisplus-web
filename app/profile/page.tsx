'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, BellOff, LogOut, Volume2, VolumeX } from 'lucide-react'
import { clearUser, getAllChapterProgress, getUser, getXpProgress } from '@/lib/user-store'
import { User, getInitials, getLevelTitle, getVehicleLabel } from '@/lib/types'
import { isMuted, toggleMuted } from '@/lib/audio'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [notificationsOn, setNotificationsOn] = useState(false)
  const [audioMuted, setAudioMuted] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.replace('/onboarding')
      return
    }
    setUser(currentUser)
    setNotificationsOn(localStorage.getItem('pp_notifications') === 'true')
    setAudioMuted(isMuted())
  }, [router])

  if (!user) return null

  const xp = getXpProgress(user)
  const completedLessons = Object.values(getAllChapterProgress()).filter(item => item.completed).length

  function handleLogout() {
    clearUser()
    router.replace('/onboarding')
  }

  function handleToggleNotifications() {
    const next = !notificationsOn
    if (next && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        const granted = permission === 'granted'
        setNotificationsOn(granted)
        localStorage.setItem('pp_notifications', String(granted))
      })
      return
    }

    setNotificationsOn(next)
    localStorage.setItem('pp_notifications', String(next))
  }

  return (
    <div className="min-h-screen px-5 pb-8 pt-8">
      <header className="surface-card rounded-[28px] p-5">
        <p className="text-sm font-semibold text-text-secondary">Profile</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
            {getInitials(user.name)}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">{user.name}</h1>
            <p className="text-sm text-text-secondary">{getLevelTitle(user.level)}</p>
            <p className="text-sm text-text-secondary">{user.country_code} {user.phone}</p>
          </div>
        </div>
        <div className="mt-5 rounded-[24px] bg-bg p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">XP progress</span>
            <span className="text-sm text-text-secondary">{xp.current}/{xp.needed}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[#ececec]">
            <div className="h-full rounded-full bg-primary" style={{ width: `${xp.pct}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-3">
        {[
          { label: 'Age', value: user.age ?? 'Not set' },
          { label: 'Vehicle', value: getVehicleLabel(user.vehicle_type) },
          { label: 'Coins', value: user.coins },
          { label: 'Lessons', value: completedLessons },
        ].map(item => (
          <div key={item.label} className="surface-card rounded-[24px] p-4">
            <p className="text-sm text-text-secondary">{item.label}</p>
            <p className="mt-2 text-xl font-bold text-text-primary">{item.value}</p>
          </div>
        ))}
      </section>

      <section className="surface-card mt-5 rounded-[28px] divide-y divide-border">
        <button
          onClick={() => setAudioMuted(toggleMuted())}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bg text-text-secondary">
            {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Audio</p>
            <p className="text-sm text-text-secondary">Question and feedback audio play automatically</p>
          </div>
          <span className="text-sm font-semibold text-text-secondary">{audioMuted ? 'Muted' : 'On'}</span>
        </button>

        <button
          onClick={handleToggleNotifications}
          className="flex w-full items-center gap-3 px-4 py-4 text-left"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-bg text-text-secondary">
            {notificationsOn ? <Bell size={18} /> : <BellOff size={18} />}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary">Notifications</p>
            <p className="text-sm text-text-secondary">Lesson reminders and progress updates</p>
          </div>
          <span className="text-sm font-semibold text-text-secondary">{notificationsOn ? 'Enabled' : 'Off'}</span>
        </button>

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-4 text-left text-primary"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-light">
            <LogOut size={18} />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Log out</p>
            <p className="text-sm text-text-secondary">Clear local progress from this device</p>
          </div>
        </button>
      </section>
    </div>
  )
}
