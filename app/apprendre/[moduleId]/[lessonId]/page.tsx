'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MODULES, LESSONS } from '@/lib/seed-data'
import { getUser, markLessonComplete, updateUserCoins, addTransaction, generateId, saveUser } from '@/lib/user-store'
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react'

export default function LessonPage() {
  const { moduleId, lessonId } = useParams()
  const router = useRouter()
  const [completed, setCompleted] = useState(false)
  const [showReward, setShowReward] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)

  const mod = MODULES.find(m => m.id === moduleId)
  const lessons = LESSONS.filter(l => l.module_id === moduleId).sort((a, b) => a.order_index - b.order_index)
  const currentIdx = lessons.findIndex(l => l.id === lessonId)
  const lesson = lessons[currentIdx]
  const prevLesson = lessons[currentIdx - 1]
  const nextLesson = lessons[currentIdx + 1]

  useEffect(() => {
    const progress: string[] = JSON.parse(localStorage.getItem('permisplus_progress') || '[]')
    if (progress.includes(lessonId as string)) {
      setAlreadyDone(true)
      setCompleted(true)
    }
  }, [lessonId])

  if (!lesson || !mod) return null

  function handleComplete() {
    if (alreadyDone) {
      if (nextLesson) router.push(`/apprendre/${moduleId}/${nextLesson.id}`)
      else router.push(`/apprendre/${moduleId}`)
      return
    }

    markLessonComplete(lesson.id)
    const updatedUser = updateUserCoins(lesson.coins_reward, 'earned', `Leçon terminée : ${lesson.title_fr}`)
    if (updatedUser) {
      addTransaction({
        id: generateId(),
        amount: lesson.coins_reward,
        type: 'earned',
        description: `Leçon terminée : ${lesson.title_fr}`,
        created_at: new Date().toISOString(),
      })
    }
    setCompleted(true)
    setAlreadyDone(true)
    setShowReward(true)

    setTimeout(() => {
      setShowReward(false)
      if (nextLesson) router.push(`/apprendre/${moduleId}/${nextLesson.id}`)
      else router.push(`/apprendre/${moduleId}`)
    }, 1800)
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* Header */}
      <div className="bg-primary px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-green-200 mb-3">
          <ChevronLeft size={20} /> {mod.title_fr}
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-white font-bold text-base flex-1 pr-3">{lesson.title_fr}</h1>
          <span className="text-green-200 text-sm shrink-0">{currentIdx + 1}/{lessons.length}</span>
        </div>
        {/* Progress bar */}
        <div className="mt-3 bg-white/20 rounded-full h-1">
          <div
            className="bg-white h-1 rounded-full transition-all"
            style={{ width: `${((currentIdx + 1) / lessons.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-5 overflow-y-auto">
        {lesson.content_json.sections.map((section, i) => (
          <div key={i} className="mb-5">
            {section.heading && (
              <h2 className="font-bold text-gray-800 mb-2 text-base">{section.heading}</h2>
            )}
            <p className="text-gray-600 leading-relaxed text-sm">{section.body}</p>
          </div>
        ))}
      </div>

      {/* Bottom actions */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-bg">
        <div className="flex gap-3">
          {prevLesson && (
            <button
              onClick={() => router.push(`/apprendre/${moduleId}/${prevLesson.id}`)}
              className="flex-none w-12 h-12 bg-white rounded-xl border border-gray-200 flex items-center justify-center active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
          )}
          <button
            onClick={handleComplete}
            className={`flex-1 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform ${
              alreadyDone ? 'bg-accent text-white' : 'bg-primary text-white'
            }`}
          >
            {alreadyDone ? (
              nextLesson ? (<><ChevronRight size={18} /> Leçon suivante</>) : (<><CheckCircle2 size={18} /> Module terminé</>)
            ) : (
              <>Marquer comme terminée · +{lesson.coins_reward} 🪙</>
            )}
          </button>
        </div>
      </div>

      {/* Coin reward animation */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl px-8 py-6 flex flex-col items-center gap-2">
              <motion.span
                className="text-5xl"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                🪙
              </motion.span>
              <p className="text-2xl font-bold text-primary">+{lesson.coins_reward}</p>
              <p className="text-gray-500 text-sm">Pièces gagnées !</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
