'use client'

import Link from 'next/link'
import { Brain, Clock, Zap } from 'lucide-react'
import { MODULES } from '@/lib/seed-data'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function QuizPage() {
  const [showTopicPicker, setShowTopicPicker] = useState(false)
  const router = useRouter()

  if (showTopicPicker) {
    return (
      <div className="px-4 pt-6 pb-4">
        <button onClick={() => setShowTopicPicker(false)} className="text-primary text-sm font-medium mb-5 flex items-center gap-1">
          ← Retour
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Choisir un thème</h2>
        <div className="space-y-2">
          {MODULES.map(mod => (
            <button
              key={mod.id}
              onClick={() => router.push(`/quiz/practice?module=${mod.id}`)}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-98 transition-transform text-left"
            >
              <span className="text-2xl">{mod.icon_emoji}</span>
              <div>
                <p className="font-medium text-gray-800 text-sm">{mod.title_fr}</p>
                <p className="text-xs text-gray-400">{mod.description_fr.slice(0, 50)}…</p>
              </div>
            </button>
          ))}
          <button
            onClick={() => router.push('/quiz/practice?module=all')}
            className="w-full bg-primary rounded-2xl p-4 flex items-center gap-4 active:scale-98 transition-transform text-left"
          >
            <span className="text-2xl">🎯</span>
            <div>
              <p className="font-medium text-white text-sm">Tous les thèmes</p>
              <p className="text-xs text-green-200">Questions mélangées</p>
            </div>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Quiz</h1>
        <p className="text-gray-500 text-sm mt-1">Entraîne-toi et teste tes connaissances</p>
      </div>

      <div className="space-y-4">
        {/* Practice mode */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <Zap size={24} className="text-blue-500" />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">Entraînement</h2>
              <p className="text-xs text-gray-400">Feedback immédiat par question</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Choisissez un thème et répondez à des questions une par une. Vous verrez immédiatement si vous avez bon et pourquoi.
          </p>
          <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
            <span>🪙 +10 pièces par quiz</span>
            <span>⏱ Sans limite de temps</span>
          </div>
          <button
            onClick={() => setShowTopicPicker(true)}
            className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            Choisir un thème
          </button>
        </div>

        {/* Mock exam mode */}
        <div className="bg-primary rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">Examen Blanc</h2>
              <p className="text-xs text-green-200">Simulation officielle · 30 minutes</p>
            </div>
          </div>
          <p className="text-sm text-green-100 mb-4">
            Simulez les conditions réelles de l'examen. Toutes les questions, un minuteur de 30 min, et une carte de score partageable à la fin.
          </p>
          <div className="flex items-center justify-between text-xs text-green-200 mb-4">
            <span>🪙 +25 pièces · +50 si parfait</span>
            <span>📋 40 questions</span>
          </div>
          <Link
            href="/quiz/mock"
            className="block w-full bg-white text-primary text-center py-3.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
          >
            Démarrer l'examen
          </Link>
        </div>
      </div>
    </div>
  )
}
