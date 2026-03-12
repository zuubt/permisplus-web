'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Coins, Gift, PackageOpen } from 'lucide-react'
import { REWARDS, getTransactions, getUser, spendCoins } from '@/lib/user-store'
import { RewardItem, User } from '@/lib/types'

const filters: Array<{ key: RewardItem['category'] | 'all'; label: string }> = [
  { key: 'all', label: 'Tout' },
  { key: 'airtime', label: 'Credit' },
  { key: 'data', label: 'Internet' },
  { key: 'coupon', label: 'Coupons' },
  { key: 'premium', label: 'Premium' },
]

export default function RewardsPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<typeof filters[number]['key']>('all')

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.replace('/onboarding')
      return
    }
    setUser(currentUser)
  }, [router])

  const visibleRewards = useMemo(() => {
    if (activeFilter === 'all') return REWARDS
    return REWARDS.filter(item => item.category === activeFilter)
  }, [activeFilter])

  if (!user) return null

  function handleRedeem(item: RewardItem) {
    if (!user) return
    if (user.coins < item.coin_cost) return
    const updated = spendCoins(item.coin_cost, `Recompense echangee : ${item.title}`)
    if (updated) setUser(updated)
  }

  return (
    <div className="min-h-screen px-5 pb-8 pt-8">
      <header className="surface-card rounded-[28px] p-5">
        <p className="text-sm font-semibold text-text-secondary">Recompenses</p>
        <h1 className="mt-1 text-3xl font-bold text-text-primary">Utilisez vos pieces pour des recompenses utiles</h1>
        <div className="mt-5 flex items-center justify-between rounded-[24px] bg-bg p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Solde disponible</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{user.coins} pieces</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-light text-accent">
            <Coins size={24} />
          </div>
        </div>
      </header>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        {filters.map(filter => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold ${
              activeFilter === filter.key ? 'bg-primary text-white' : 'metric-chip text-text-secondary'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="mt-5 space-y-3">
        {visibleRewards.map(item => {
          const canRedeem = user.coins >= item.coin_cost
          return (
            <div key={item.id} className="surface-card rounded-[28px] p-5">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">{item.category}</p>
                  <h2 className="mt-2 text-xl font-semibold text-text-primary">{item.title}</h2>
                  <p className="mt-1 text-sm text-text-secondary">{item.subtitle}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-text-secondary">
                  <Gift size={20} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Cout</p>
                  <p className="mt-1 text-lg font-bold text-text-primary">{item.coin_cost} pieces</p>
                </div>
                <button
                  disabled={!canRedeem}
                  onClick={() => handleRedeem(item)}
                  className="rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
                >
                  Echanger
                </button>
              </div>
            </div>
          )
        })}
      </section>

      <section className="surface-card mt-5 rounded-[28px] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg text-text-secondary">
            <PackageOpen size={20} />
          </div>
          <div>
            <p className="font-semibold text-text-primary">Echanges recents</p>
            <p className="text-sm text-text-secondary">Des recompenses simples, concretes et faciles a comprendre.</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          {getTransactions()
            .filter(item => item.amount < 0)
            .slice(0, 3)
            .map(item => (
              <div key={item.id} className="rounded-2xl bg-bg px-4 py-3">
                <p className="text-sm font-semibold text-text-primary">{item.description}</p>
                <p className="text-xs text-text-secondary">{new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
              </div>
            ))}
        </div>
      </section>
    </div>
  )
}
