'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getUser, updateUserCoins, addTransaction, generateId, getTransactions, LocalTransaction } from '@/lib/user-store'
import { User } from '@/lib/types'
import CoinCounter from '@/components/CoinCounter'
import { Share2, Copy, CheckCircle2, WifiOff } from 'lucide-react'

const COIN_RATE = 5 // 5 coins = 100 FCFA

export default function RecompensesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [amount, setAmount] = useState('')
  const [operator, setOperator] = useState<'togocel' | 'moov'>('togocel')
  const [isOnline, setIsOnline] = useState(true)
  const [toast, setToast] = useState('')
  const [transactions, setTransactions] = useState<LocalTransaction[]>([])
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    setTransactions(getTransactions())
    setIsOnline(navigator.onLine)
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  function handleRedeem() {
    if (!user || !amount || !isOnline) return
    const fcfa = parseInt(amount)
    if (isNaN(fcfa) || fcfa < 100) return
    const coinsNeeded = fcfa / 100 * COIN_RATE
    if (user.coins_balance < coinsNeeded) {
      showToast('Solde insuffisant')
      return
    }
    const updated = updateUserCoins(-coinsNeeded, 'redeemed', `Rechargement ${fcfa} FCFA ${operator === 'togocel' ? 'Togocel' : 'Moov Africa'}`)
    if (updated) {
      setUser({ ...updated })
      const tx: LocalTransaction = { id: generateId(), amount: -coinsNeeded, type: 'redeemed', description: `Rechargement ${fcfa} FCFA ${operator === 'togocel' ? 'Togocel' : 'Moov Africa'}`, created_at: new Date().toISOString() }
      addTransaction(tx)
      setTransactions(getTransactions())
      setAmount('')
      showToast(`${fcfa} FCFA crédités sur votre numéro ✓`)
    }
  }

  function handleCopyCode() {
    if (!user) return
    navigator.clipboard.writeText(user.referral_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShareReferral() {
    if (!user) return
    const text = `Prépare ton permis de conduire avec PermisPlus ! 🚗\nUtilise mon code de parrainage : ${user.referral_code}\nTélécharge l'app : permisplus.tg`
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank')
  }

  if (!user) return null

  const coinsNeeded = amount ? Math.ceil(parseInt(amount || '0') / 100 * COIN_RATE) : 0

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Récompenses</h1>

      {/* Coin balance */}
      <div className="bg-primary rounded-2xl p-5 flex items-center gap-4">
        <motion.span className="text-4xl" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>🪙</motion.span>
        <div>
          <p className="text-green-200 text-sm">Votre solde</p>
          <p className="text-white text-3xl font-bold"><CoinCounter value={user.coins_balance} /></p>
          <p className="text-green-200 text-xs mt-0.5">{Math.floor(user.coins_balance / COIN_RATE * 100)} FCFA disponibles</p>
        </div>
      </div>

      {/* Redemption form */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-3">Recharger de l'airtime</h2>

        {!isOnline && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 text-amber-700 text-xs">
            <WifiOff size={14} />
            Une connexion est requise pour racheter des pièces
          </div>
        )}

        <div className="mb-3">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Montant (FCFA)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Ex: 100, 200, 500..."
            min={100}
            step={100}
            className="w-full bg-gray-50 rounded-xl border border-gray-100 px-4 py-3 outline-none text-gray-800 placeholder-gray-300 focus:border-primary transition-colors"
          />
          {amount && parseInt(amount) >= 100 && (
            <p className="text-xs text-gray-400 mt-1">Coût : {coinsNeeded} pièces</p>
          )}
        </div>

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Opérateur</label>
          <div className="grid grid-cols-2 gap-2">
            {(['togocel', 'moov'] as const).map(op => (
              <button
                key={op}
                onClick={() => setOperator(op)}
                className={`py-3 rounded-xl text-sm font-semibold border-2 transition-all ${operator === op ? 'border-primary bg-green-50 text-primary' : 'border-gray-100 bg-gray-50 text-gray-500'}`}
              >
                {op === 'togocel' ? '📶 Togocel' : '📡 Moov Africa'}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleRedeem}
          disabled={!isOnline || !amount || parseInt(amount) < 100 || user.coins_balance < coinsNeeded}
          className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-40 active:scale-95 transition-transform"
        >
          Confirmer le rechargement
        </button>
      </div>

      {/* Referral section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-1">Parrainage</h2>
        <p className="text-xs text-gray-400 mb-3">Invitez un ami → +100 pièces quand il termine son 1er quiz</p>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-0.5">Votre code</p>
            <p className="font-mono font-bold text-primary text-lg tracking-widest">{user.referral_code}</p>
          </div>
          <button onClick={handleCopyCode} className="w-12 h-12 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center shrink-0 active:scale-95 transition-transform">
            {copied ? <CheckCircle2 size={20} className="text-accent" /> : <Copy size={20} className="text-gray-500" />}
          </button>
        </div>
        <button
          onClick={handleShareReferral}
          className="w-full bg-green-500 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          <Share2 size={18} /> Partager sur WhatsApp
        </button>
      </div>

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-3">Historique</h2>
          <div className="space-y-2">
            {transactions.map(tx => {
              const typeColor = tx.type === 'redeemed' ? 'bg-red-100 text-red-600' : tx.type === 'bonus' ? 'bg-purple-100 text-purple-600' : tx.type === 'referral' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-700'
              const typeLabel = tx.type === 'redeemed' ? 'Rachat' : tx.type === 'bonus' ? 'Bonus' : tx.type === 'referral' ? 'Parrainage' : 'Gagné'
              return (
                <div key={tx.id} className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${typeColor}`}>{typeLabel}</span>
                  <p className="text-sm text-gray-600 flex-1 truncate">{tx.description}</p>
                  <span className={`text-sm font-bold shrink-0 ${tx.amount > 0 ? 'text-primary' : 'text-red-500'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}🪙
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg z-50 max-w-xs text-center"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
