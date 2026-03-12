export const quizPhotoAssets: Record<string, string> = {
  steering_wheel: '/assets/library/steering-wheel.jpg',
  warning_triangle: '/assets/library/warning-triangle.jpg',
  brake_pedal: '/assets/driving/brake-pedal-1.png',
  clutch_pedal: '/assets/driving/clutch-pedal-1.png',
  accelerator_pedal: '/assets/driving/accelerator-pedal-1.png',
  pedal_set: '/assets/driving/pedal-set-1.png',
}

export function getQuizPhotoAsset(key?: string): string | null {
  if (!key) return null
  return quizPhotoAssets[key] ?? null
}
