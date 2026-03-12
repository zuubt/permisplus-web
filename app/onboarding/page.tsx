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
  { type: 'car', label: 'Car', icon: CarFront },
  { type: 'motorcycle', label: 'Motorcycle', icon: Bike },
  { type: 'truck', label: 'Truck', icon: Truck },
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
            <p className="text-xs text-text-disabled">Driving preparation for adult learners</p>
          </div>
        </div>

        <div className="surface-card mb-8 rounded-[28px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary">Focused learning</span>
            <ShieldCheck size={18} className="text-text-secondary" />
          </div>
          <div className="relative overflow-hidden rounded-[24px] border border-border bg-[#f4f4f5] p-6">
            <div className="mb-4 flex h-40 items-center justify-center rounded-[20px] border border-dashed border-border bg-white">
              <div className="text-center">
                <p className="text-sm font-semibold text-text-primary">Driving hero image placeholder</p>
                <p className="mt-1 text-xs text-text-secondary">Expected asset: `assets/onboarding/driving-hero.jpg`</p>
              </div>
            </div>
            <p className="text-xs text-text-secondary">Use a real driving-related photo here when the final asset is available.</p>
          </div>
        </div>

        <div className="mt-auto">
          <h1 className="max-w-[15ch] text-4xl font-bold leading-tight text-text-primary">
            Pass your driving license with confidence.
          </h1>
          <p className="mt-4 max-w-[30ch] text-base leading-7 text-text-secondary">
            Learn through quizzes, complete lessons, and earn rewards in a focused, mobile-first experience.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <button
            onClick={() => setStep('phone')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white shadow-card transition-transform active:scale-[0.99]"
          >
            Get Started
          </button>
          <button
            onClick={() => setStep('phone')}
            className="w-full rounded-2xl border border-border bg-white px-4 py-4 text-base font-semibold text-text-primary"
          >
            Log In
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
        <div className="flex items-center justify-between">
          <Image src="/logo.png" alt="PermisPlus logo" width={28} height={28} />
          <span className="text-xs font-medium text-text-secondary">Step {stepIndex} of {steps.length - 1}</span>
        </div>
      </div>

      <div className="flex-1">
        {step === 'phone' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Account setup</p>
              <h1 className="text-3xl font-bold text-text-primary">Enter your phone number</h1>
              <p className="mt-3 text-base leading-7 text-text-secondary">We will send you a verification code.</p>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <label className="mb-2 block text-sm font-semibold text-text-primary">Phone number</label>
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
              <h1 className="text-3xl font-bold text-text-primary">Enter the verification code</h1>
              <p className="mt-3 text-base leading-7 text-text-secondary">We sent a code to {countryCode} {phone || 'your number'}.</p>
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
                <button className="font-semibold text-primary">Resend code</button>
                <span className="text-text-secondary">Demo code: 1234</span>
              </div>
            </div>
          </div>
        )}

        {step === 'name' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">Profile</p>
              <h1 className="text-3xl font-bold text-text-primary">What is your first name?</h1>
            </div>
            <div className="surface-card rounded-[28px] p-5">
              <label className="mb-2 block text-sm font-semibold text-text-primary">First name</label>
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
              <p className="mb-2 text-sm font-semibold text-primary">Profile</p>
              <h1 className="text-3xl font-bold text-text-primary">How old are you?</h1>
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
              <p className="mb-2 text-sm font-semibold text-primary">Learning setup</p>
              <h1 className="text-3xl font-bold text-text-primary">What type of vehicle are you learning for?</h1>
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
                    <p className="text-sm text-text-secondary">Quiz path adapted for {label.toLowerCase()} learners</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'how_it_works' && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary">How it works</p>
              <h1 className="text-3xl font-bold text-text-primary">PermisPlus keeps learning simple.</h1>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: BookOpenText,
                  title: 'Learn with quizzes',
                  description: 'Answer short quizzes instead of reading long lessons.',
                },
                {
                  icon: ShieldCheck,
                  title: 'Complete lessons',
                  description: 'Finish quiz sets to unlock new chapters.',
                },
                {
                  icon: Coins,
                  title: 'Earn coins',
                  description: 'Collect coins and redeem them in the reward store.',
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
            Continue
          </button>
        )}

        {step === 'otp' && (
          <button
            disabled={otpValue !== '1234'}
            onClick={() => setStep('name')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Verify
          </button>
        )}

        {step === 'name' && (
          <button
            disabled={!name.trim()}
            onClick={() => setStep('age')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Continue
          </button>
        )}

        {step === 'age' && (
          <button
            disabled={!age || Number(age) < 16}
            onClick={() => setStep('vehicle')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-[#f0a39c]"
          >
            Continue
          </button>
        )}

        {step === 'vehicle' && (
          <button
            onClick={() => setStep('how_it_works')}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white"
          >
            Continue
          </button>
        )}

        {step === 'how_it_works' && (
          <button
            onClick={finishOnboarding}
            className="w-full rounded-2xl bg-primary px-4 py-4 text-base font-semibold text-white"
          >
            Start First Lesson
          </button>
        )}
      </div>
    </div>
  )
}
