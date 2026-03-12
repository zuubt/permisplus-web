'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CarFront, Bike, Truck, Bus, ShieldCheck, BookOpenText, Coins } from 'lucide-react'
import { createUser } from '@/lib/user-store'
import { VehicleType } from '@/lib/types'

type Step =
  | 'welcome'
  | 'phone'
  | 'otp'
  | 'name'
  | 'age'
  | 'vehicle'
  | 'how_it_works'

const steps: Step[] = ['welcome', 'phone', 'otp', 'name', 'age', 'vehicle', 'how_it_works']

const vehicles: Array<{ type: VehicleType; label: string; icon: typeof CarFront }> = [
  { type: 'car', label: 'Voiture', icon: CarFront },
  { type: 'motorcycle', label: 'Moto', icon: Bike },
  { type: 'truck', label: 'Camion', icon: Truck },
  { type: 'bus', label: 'Bus', icon: Bus },
]

const otpLength = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('welcome')
  const [countryCode, setCountryCode] = useState('+228')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [vehicleType, setVehicleType] = useState<VehicleType>('car')

  const stepIndex = steps.indexOf(step)
  const progress = useMemo(() => {
    if (step === 'welcome') return 0
    return Math.round((stepIndex / (steps.length - 1)) * 100)
  }, [step, stepIndex])

  function goBack() {
    if (stepIndex > 0) setStep(steps[stepIndex - 1])
  }

  function setOtpDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1)
    setOtp(current => current.map((item, itemIndex) => (itemIndex === index ? digit : item)))
  }

  function finishOnboarding() {
    createUser({
      name: name.trim(),
      phone: phone.replace(/\s/g, ''),
      country_code: countryCode,
      age: age ? Number(age) : null,
      vehicle_type: vehicleType,
    })
    router.replace('/learn')
  }

  const otpValue = otp.join('')

  if (step === 'welcome') {
    return (
      <div className="flex min-h-screen flex-col px-6 pb-8 pt-10">
        <div className="mb-10 flex items-center gap-3">
          <div className="surface-card flex h-14 w-14 items-center justify-center rounded-2xl">
            <Image src="/logo.png" alt="PermisPlus logo" width={36} height={36} />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">PermisPlus</p>
            <p className="text-xs text-text-disabled">Preparation au permis pour adultes</p>
          </div>
        </div>

        <div className="surface-card mb-8 rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">Apprentissage cible</span>
            <ShieldCheck size={18} className="text-text-secondary" />
          </div>
          <div className="grid grid-cols-[1.2fr_0.8fr] gap-3">
            <div className="relative h-44 overflow-hidden rounded-[24px] bg-[#f4f4f5]">
              <Image src="/assets/driving/pedal-set-1.png" alt="Jeu de pedales" fill className="object-cover" />
            </div>
            <div className="grid gap-3">
              <div className="relative h-[86px] overflow-hidden rounded-[20px] bg-white">
                <Image src="/assets/driving/clutch-pedal-1.png" alt="Pedale d'embrayage" fill className="object-cover" />
              </div>
              <div className="relative h-[86px] overflow-hidden rounded-[20px] bg-white">
                <Image src="/assets/driving/brake-pedal-1.png" alt="Pedale de frein" fill className="object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <h1 className="max-w-[15ch] text-4xl font-bold leading-tight text-text-primary">
            Reussissez votre permis de conduire avec confiance.
          </h1>
          <p className="mt-4 max-w-[30ch] text-base leading-7 text-text-secondary">
            Apprenez avec des quiz, terminez des lecons et gagnez des recompenses dans une experience mobile, claire et serieuse.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => setStep('phone')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white shadow-card transition-transform active:scale-[0.99]"
          >
            Commencer
          </button>
          <button
            onClick={() => setStep('phone')}
            className="w-full rounded-2xl border border-border bg-white px-4 py-4 text-base font-semibold text-text-primary"
          >
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col px-6 pb-8 pt-8">
      <div className="mb-8">
        <div className="mb-5 flex items-center gap-4">
          <button
            onClick={goBack}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-text-primary"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ececec]">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <div className="surface-card flex items-center justify-between rounded-[24px] px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card">
              <Image src="/logo.png" alt="PermisPlus logo" width={30} height={30} className="h-8 w-8 object-contain" />
            </div>
            <div>
              <p className="text-base font-semibold text-text-primary">PermisPlus</p>
              <p className="text-xs text-text-secondary">Preparation au permis pour adultes</p>
            </div>
          </div>
          <span className="text-xs font-medium text-text-secondary">Etape {stepIndex} sur {steps.length - 1}</span>
        </div>
      </div>

      <div className="flex-1">
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Creation du compte</p>
              <h1 className="text-3xl font-bold text-text-primary">Entrez votre numero de telephone</h1>
              <p className="mt-3 text-base leading-7 text-text-secondary">Nous allons vous envoyer un code de verification.</p>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <label className="mb-2 block text-sm font-semibold text-text-primary">Numero de telephone</label>
              <div className="flex gap-3">
                <select
                  value={countryCode}
                  onChange={event => setCountryCode(event.target.value)}
                  className="rounded-2xl border border-border bg-bg px-4 py-4 text-sm font-semibold text-text-primary"
                >
                  <option value="+228">TG +228</option>
                  <option value="+233">GH +233</option>
                  <option value="+229">BJ +229</option>
                </select>
                <input
                  value={phone}
                  onChange={event => setPhone(event.target.value)}
                  placeholder="90 00 00 00"
                  inputMode="tel"
                  className="min-w-0 flex-1 rounded-2xl border border-border bg-bg px-4 py-4 text-base text-text-primary"
                />
              </div>
            </div>
          </div>
        )}

        {step === 'otp' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Verification</p>
              <h1 className="text-3xl font-bold text-text-primary">Entrez le code de verification</h1>
              <p className="mt-3 text-base leading-7 text-text-secondary">Nous avons envoye un code au {countryCode} {phone || 'numero saisi'}.</p>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <div className="grid grid-cols-4 gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    value={digit}
                    onChange={event => setOtpDigit(index, event.target.value)}
                    inputMode="numeric"
                    maxLength={1}
                    className="h-16 rounded-2xl border border-border bg-bg text-center text-2xl font-semibold text-text-primary"
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm">
                <button className="font-semibold text-primary">Renvoyer le code</button>
                <span className="text-text-secondary">Code demo : 1234</span>
              </div>
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Profil</p>
              <h1 className="text-3xl font-bold text-text-primary">Quel est votre prenom ?</h1>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <label className="mb-2 block text-sm font-semibold text-text-primary">Prenom</label>
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Kofi"
                autoFocus
                className="w-full rounded-2xl border border-border bg-bg px-4 py-4 text-base text-text-primary"
              />
            </div>
          </div>
        )}

        {step === 'age' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Profil</p>
              <h1 className="text-3xl font-bold text-text-primary">Quel age avez-vous ?</h1>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <label className="mb-2 block text-sm font-semibold text-text-primary">Age</label>
              <input
                value={age}
                onChange={event => setAge(event.target.value.replace(/\D/g, '').slice(0, 2))}
                inputMode="numeric"
                placeholder="22"
                className="w-full rounded-2xl border border-border bg-bg px-4 py-4 text-base text-text-primary"
              />
            </div>
          </div>
        )}

        {step === 'vehicle' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Parcours d'apprentissage</p>
              <h1 className="text-3xl font-bold text-text-primary">Pour quel type de vehicule apprenez-vous ?</h1>
            </div>
            <div className="grid gap-3">
              {vehicles.map(({ type, label, icon: Icon }) => (
                <button
                  key={type}
                  onClick={() => setVehicleType(type)}
                  className={`surface-card flex items-center gap-4 rounded-[24px] p-5 text-left transition-colors ${
                    vehicleType === type ? 'border-primary bg-primary-light' : ''
                  }`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${vehicleType === type ? 'bg-white text-primary' : 'bg-bg text-text-secondary'}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-text-primary">{label}</p>
                    <p className="text-sm text-text-secondary">Parcours de quiz adapte aux apprenants en {label.toLowerCase()}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'how_it_works' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Fonctionnement</p>
              <h1 className="text-3xl font-bold text-text-primary">PermisPlus rend l'apprentissage simple.</h1>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: BookOpenText,
                  title: 'Apprendre avec des quiz',
                  description: 'Repondez a de courts quiz au lieu de lire de longues lecons.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Terminer les lecons',
                  description: 'Finissez les series de quiz pour debloquer de nouveaux chapitres.',
                },
                {
                  icon: Coins,
                  title: 'Gagner des pieces',
                  description: 'Collectez des pieces et echangez-les dans la boutique.',
                },
              ].map(({ icon: Icon, title, description }) => (
                <div key={title} className="surface-card flex gap-4 rounded-[24px] p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-text-secondary">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {step === 'phone' && (
          <button
            disabled={phone.trim().length < 8}
            onClick={() => setStep('otp')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Continuer
          </button>
        )}

        {step === 'otp' && (
          <button
            disabled={otpValue !== '1234'}
            onClick={() => setStep('name')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Verifier
          </button>
        )}

        {step === 'name' && (
          <button
            disabled={!name.trim()}
            onClick={() => setStep('age')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Continuer
          </button>
        )}

        {step === 'age' && (
          <button
            disabled={!age || Number(age) < 16}
            onClick={() => setStep('vehicle')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Continuer
          </button>
        )}

        {step === 'vehicle' && (
          <button
            onClick={() => setStep('how_it_works')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white"
          >
            Continuer
          </button>
        )}

        {step === 'how_it_works' && (
          <button
            onClick={finishOnboarding}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white"
          >
            Commencer la premiere lecon
          </button>
        )}
      </div>
    </div>
  )
}
