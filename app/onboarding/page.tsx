'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, ChevronLeft, Car, Bike, Truck } from 'lucide-react'
import { createUser, createGuestUser } from '@/lib/user-store'
import { AgeRange, VehicleType } from '@/lib/types'

type Step = 'welcome' | 'name' | 'age' | 'vehicle' | 'avatar' | 'how_it_works'

const AVATAR_INITIALS = ['A', 'B', 'E', 'F', 'K', 'M', 'N', 'S', 'Y']

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [ageRange, setAgeRange] = useState<AgeRange | null>(null)
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null)
  const [avatarInitial, setAvatarInitial] = useState('K')

  const stepOrder: Step[] = ['welcome', 'name', 'age', 'vehicle', 'avatar', 'how_it_works']
  const stepIndex = stepOrder.indexOf(step)
  const progress = Math.round((stepIndex / (stepOrder.length - 1)) * 100)

  function goBack() {
    if (stepIndex > 0) setStep(stepOrder[stepIndex - 1])
  }

  function finish() {
    const user = createUser({
      name: name.trim() || 'Utilisateur',
      phone: phone.replace(/\s/g, ''),
      age_range: ageRange ?? '18-25',
      vehicle_type: vehicleType ?? 'car',
      avatar_initial: avatarInitial,
    })
    router.replace('/map')
  }

  // ── Welcome screen ─────────────────────────────────────────────────────────
  if (step === 'welcome') {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
            <span className="text-white text-4xl font-black">P+</span>
          </div>
          <h1 className="text-3xl font-black text-text-primary leading-tight mb-3">
            Pass your driving<br />license exam.
          </h1>
          <p className="text-text-secondary text-base">
            Apprends en pratiquant des quiz interactifs
          </p>
          {/* Car illustration placeholder */}
          <div className="my-10 text-8xl">🚗</div>
        </div>

        <div className="px-6 pb-10 space-y-4">
          <button
            onClick={() => setStep('name')}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base active:scale-95 transition-transform"
          >
            Commencer gratuitement
          </button>
          <button
            onClick={() => {
              createGuestUser()
              router.replace('/map')
            }}
            className="w-full text-text-secondary text-sm font-medium py-2"
          >
            Continuer sans compte
          </button>
          <p className="text-center text-text-disabled text-xs">
            Déjà un compte ?{' '}
            <button className="text-primary font-semibold" onClick={() => setStep('name')}>
              Se connecter
            </button>
          </p>
        </div>
      </div>
    )
  }

  // ── Step layout wrapper ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Progress bar + back */}
      <div className="px-6 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-4">
          {step !== 'name' && (
            <button onClick={goBack} className="text-text-secondary p-1">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {step !== 'how_it_works' && (
          <p className="text-text-disabled text-xs">
            Étape {stepIndex} sur {stepOrder.length - 2}
          </p>
        )}
      </div>

      <div className="flex-1 px-6 py-4">

        {/* ── Name step ─────────────────────────────────────────────────────── */}
        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary">Comment vous appelle-t-on ?</h2>
              <p className="text-text-secondary text-sm mt-1">Étape 1 sur 4</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Prénom complet</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="ex: Kofi Mensah"
                  autoComplete="given-name"
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('age')}
                  className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3.5 text-text-primary placeholder-text-disabled outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-text-primary mb-1.5 block">Numéro de téléphone (optionnel)</label>
                <div className="flex items-center gap-2 bg-bg border-2 border-border rounded-xl px-4 py-3.5 focus-within:border-primary transition-colors">
                  <span className="text-text-secondary text-sm shrink-0">🇹🇬 +228</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="90 00 00 00"
                    autoComplete="off"
                    className="flex-1 bg-transparent outline-none text-text-primary placeholder-text-disabled"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Age step ──────────────────────────────────────────────────────── */}
        {step === 'age' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary">Quel âge avez-vous ?</h2>
              <p className="text-text-secondary text-sm mt-1">Étape 2 sur 4</p>
            </div>
            <div className="space-y-3">
              {(['16-18', '18-25', '25-35', '35+'] as AgeRange[]).map(range => (
                <button
                  key={range}
                  onClick={() => setAgeRange(range)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    ageRange === range
                      ? 'border-primary bg-primary-light text-primary font-bold'
                      : 'border-border bg-bg text-text-primary'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    ageRange === range ? 'border-primary' : 'border-text-disabled'
                  }`}>
                    {ageRange === range && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                  </div>
                  <span className="font-semibold">{range} ans</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Vehicle type step ─────────────────────────────────────────────── */}
        {step === 'vehicle' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary">Que voulez-vous conduire ?</h2>
              <p className="text-text-secondary text-sm mt-1">Étape 3 sur 4</p>
            </div>
            <div className="space-y-3">
              {([
                { type: 'car' as VehicleType, label: 'Voiture (Cat B)', icon: Car, emoji: '🚗' },
                { type: 'motorcycle' as VehicleType, label: 'Moto (Cat A)', icon: Bike, emoji: '🏍️' },
                { type: 'truck' as VehicleType, label: 'Camion (Cat C)', icon: Truck, emoji: '🚛' },
              ]).map(({ type, label, emoji }) => (
                <button
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                    vehicleType === type
                      ? 'border-primary bg-primary-light'
                      : 'border-border bg-bg'
                  }`}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className={`font-semibold ${vehicleType === type ? 'text-primary' : 'text-text-primary'}`}>
                    {label}
                  </span>
                  {vehicleType === type && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Avatar step ───────────────────────────────────────────────────── */}
        {step === 'avatar' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary">Choisissez votre avatar</h2>
              <p className="text-text-secondary text-sm mt-1">Étape 4 sur 4</p>
            </div>
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-3xl text-white font-black shadow-lg">
                {avatarInitial}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-secondary mb-3">Choisissez une lettre</p>
              <div className="grid grid-cols-5 gap-3">
                {AVATAR_INITIALS.map(letter => (
                  <button
                    key={letter}
                    onClick={() => setAvatarInitial(letter)}
                    className={`aspect-square rounded-full text-lg font-black flex items-center justify-center transition-colors ${
                      avatarInitial === letter
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-bg border-2 border-border text-text-primary'
                    }`}
                  >
                    {letter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── How It Works ──────────────────────────────────────────────────── */}
        {step === 'how_it_works' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-text-primary">Comment ça marche ?</h2>
              <p className="text-text-secondary text-sm mt-1">Apprenez à votre rythme</p>
            </div>
            <div className="space-y-4">
              {[
                { emoji: '🧩', title: 'Quiz interactifs', desc: 'Images, scénarios, vrai/faux — 8 formats de questions pour rester engagé' },
                { emoji: '🏆', title: 'Gagnez des récompenses', desc: 'XP, pièces et crédits téléphoniques pour chaque chapitre complété' },
                { emoji: '📶', title: 'Hors ligne', desc: 'Apprenez n\'importe où, même sans connexion internet' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-4 bg-bg rounded-xl p-4 border border-border">
                  <span className="text-3xl shrink-0">{emoji}</span>
                  <div>
                    <p className="font-bold text-text-primary">{title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="px-6 pb-10">
        <button
          onClick={() => {
            if (step === 'name') {
              if (!name.trim()) return
              setStep('age')
            } else if (step === 'age') {
              if (!ageRange) return
              setStep('vehicle')
            } else if (step === 'vehicle') {
              if (!vehicleType) return
              setStep('avatar')
            } else if (step === 'avatar') {
              setStep('how_it_works')
            } else if (step === 'how_it_works') {
              finish()
            }
          }}
          disabled={
            (step === 'name' && !name.trim()) ||
            (step === 'age' && !ageRange) ||
            (step === 'vehicle' && !vehicleType)
          }
          className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 transition-transform"
        >
          {step === 'how_it_works' ? 'Commencer mon premier quiz' : 'Continuer'}
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
