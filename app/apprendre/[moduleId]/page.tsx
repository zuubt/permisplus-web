'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { MODULES, LESSONS } from '@/lib/seed-data'
import { ChevronLeft, CheckCircle2, Lock } from 'lucide-react'

export default function ModuleDetailPage() {
  const { moduleId } = useParams()
  const router = useRouter()
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('permisplus_progress') || '[]')
    setCompletedLessons(progress)
  }, [])

  const mod = MODULES.find(m => m.id === moduleId)
  const lessons = LESSONS.filter(l => l.module_id === moduleId).sort((a, b) => a.order_index - b.order_index)

  if (!mod) return null

  return (
    <div>
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-green-200 mb-4">
          <ChevronLeft size={20} /> Modules
        </button>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{mod.icon_emoji}</span>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{mod.title_fr}</h1>
            <p className="text-green-200 text-sm">{lessons.length} leçons · +5 pièces par leçon</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-2">
        {lessons.map((lesson, idx) => {
          const isDone = completedLessons.includes(lesson.id)
          return (
            <Link
              key={lesson.id}
              href={`/apprendre/${moduleId}/${lesson.id}`}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm active:scale-98 transition-transform block"
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isDone ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                {isDone ? <CheckCircle2 size={18} /> : idx + 1}
              </div>
              <div className="flex-1">
                <p className={`font-medium text-sm ${isDone ? 'text-gray-500' : 'text-gray-800'}`}>{lesson.title_fr}</p>
                <p className="text-xs text-gray-400 mt-0.5">+{lesson.coins_reward} pièces 🪙</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
