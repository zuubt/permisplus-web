'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrGetUser, createGuestUser, saveUser } from '@/lib/user-store'
import { ChevronRight, Phone, Shield } from 'lucide-react'

type Step = 'phone' | 'name' | 'otp'

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [loading, setLoading] = useState(false)

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    if (value && index < 3) {
      const el = document.getElementById(`otp-${index + 1}`)
      el?.focus()
    }
    if (next.every(d => d !== '') && index === 3) {
      handleVerify(next.join(''))
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  function handlePhoneSubmit() {
    const cleaned = phone.replace(/\s/g, '')
    if (cleaned.length < 8) return
    setStep('name')
  }

  function handleNameSubmit() {
    if (!name.trim()) return
    setStep('otp')
  }

  function handleVerify(code: string) {
    setLoading(true)
    setTimeout(() => {
      const user = createOrGetUser(phone.replace(/\s/g, ''), name.trim(), 'Lomé')
      setLoading(false)
      router.replace('/')
    }, 800)
  }

  function handleGuest() {
    createGuestUser()
    router.replace('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* Header */}
      <div className="bg-primary px-6 pt-16 pb-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
          <span className="text-3xl">🚗</span>
        </div>
        <h1 className="text-white text-2xl font-bold">PermisPlus</h1>
        <p className="text-green-200 text-sm mt-1 text-center">Apprendre. Pratiquer. Obtenir son permis.</p>
      </div>

      <div className="flex-1 px-6 py-8">
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Commencer</h2>
              <p className="text-gray-500 text-sm mt-1">Entrez votre numéro de téléphone</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Numéro de téléphone</label>
              <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-gray-100 px-4 py-3 focus-within:border-primary transition-colors">
                <span className="text-gray-400 text-sm">🇹🇬 +228</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="90 00 00 00"
                  className="flex-1 outline-none text-gray-800 placeholder-gray-300 bg-transparent"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && handlePhoneSubmit()}
                />
              </div>
            </div>
            <button
              onClick={handlePhoneSubmit}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Continuer <ChevronRight size={20} />
            </button>
            <div className="text-center">
              <button onClick={handleGuest} className="text-primary text-sm font-medium underline-offset-2 underline">
                Continuer sans compte
              </button>
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Votre prénom</h2>
              <p className="text-gray-500 text-sm mt-1">Comment doit-on vous appeler ?</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Prénom</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Kofi"
                className="w-full bg-white rounded-xl border-2 border-gray-100 px-4 py-3 outline-none text-gray-800 placeholder-gray-300 focus:border-primary transition-colors"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
            <button
              onClick={handleNameSubmit}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Recevoir le code <ChevronRight size={20} />
            </button>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                <Shield size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Code de vérification</h2>
                <p className="text-gray-500 text-sm">Entrez n'importe quel code à 4 chiffres</p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  className="w-14 h-14 text-center text-2xl font-bold bg-white rounded-xl border-2 border-gray-100 outline-none focus:border-primary transition-colors text-gray-800"
                />
              ))}
            </div>
            {loading && (
              <div className="flex justify-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <button
              onClick={() => handleVerify(otp.join(''))}
              disabled={otp.some(d => !d) || loading}
              className="w-full bg-primary text-white py-4 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
            >
              Vérifier
            </button>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 text-center">
        <p className="text-xs text-gray-400">En continuant, vous acceptez nos conditions d'utilisation.</p>
        <p className="text-xs text-gray-400 mt-1">PermisPlus — MIAGROUP · Lomé, Togo</p>
      </div>
    </div>
  )
}
