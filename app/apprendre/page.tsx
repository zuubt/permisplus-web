'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { MODULES, LESSONS } from '@/lib/seed-data'
import { CheckCircle2 } from 'lucide-react'

export default function ApprendrePage() {
  const [completedLessons, setCompletedLessons] = useState<string[]>([])

  useEffect(() => {
    const progress = JSON.parse(localStorage.getItem('permisplus_progress') || '[]')
    setCompletedLessons(progress)
  }, [])

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-800">Apprendre</h1>
        <p className="text-gray-500 text-sm mt-1">8 modules · {LESSONS.length} leçons</p>
      </div>

      <div className="space-y-3">
        {MODULES.map((mod, idx) => {
          const modLessons = LESSONS.filter(l => l.module_id === mod.id)
          const done = modLessons.filter(l => completedLessons.includes(l.id)).length
          const pct = modLessons.length > 0 ? Math.round((done / modLessons.length) * 100) : 0
          const isComplete = done === modLessons.length && modLessons.length > 0

          return (
            <Link
              key={mod.id}
              href={`/apprendre/${mod.id}`}
              className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 active:scale-98 transition-transform block"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${isComplete ? 'bg-green-50' : 'bg-gray-50'}`}>
                {mod.icon_emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-semibold text-gray-800 text-sm truncate">{mod.title_fr}</p>
                  {isComplete && <CheckCircle2 size={16} className="text-accent shrink-0" />}
                </div>
                <p className="text-xs text-gray-400 mb-2 truncate">{mod.description_fr}</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: isComplete ? '#4CAF50' : '#1A5C38' }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{done}/{modLessons.length}</span>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
