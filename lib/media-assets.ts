export const quizPhotoAssets: Record<string, string> = {
  steering_wheel: '/assets/library/steering-wheel.jpg',
  gear_lever: '/assets/library/gear-lever.jpg',
  warning_triangle: '/assets/library/warning-triangle.jpg',
  car_jack: '/assets/library/car-jack.jpg',
  traffic_cones: '/assets/library/traffic-cones.jpg',
  warning_engine: '/assets/library/engine-warning-light.png',
  warning_oil: '/assets/library/oil-warning-light.png',
  seatbelt: '/assets/library/seatbelt.jpg',
  reflective_vest: '/assets/library/reflective-vest.jpg',
  first_aid_kit: '/assets/library/first-aid-kit.jpg',
  spare_wheel: '/assets/library/spare-wheel.jpg',
  rearview_mirror: '/assets/library/rearview-mirror.jpg',
  brake_pedal: '/assets/driving/brake-pedal-1.png',
  clutch_pedal: '/assets/driving/clutch-pedal-1.png',
  accelerator_pedal: '/assets/driving/accelerator-pedal-1.png',
  pedal_set: '/assets/driving/pedal-set-1.png',
}

export function getQuizPhotoAsset(key?: string): string | null {
  if (!key) return null
  return quizPhotoAssets[key] ?? null
}
