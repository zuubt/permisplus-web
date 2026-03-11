const MUTE_KEY = 'pp_audio_muted'

export function isMuted(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(MUTE_KEY) === 'true'
}

export function setMuted(muted: boolean): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(MUTE_KEY, String(muted))
  if (muted) stopSpeech()
}

export function toggleMuted(): boolean {
  const next = !isMuted()
  setMuted(next)
  return next
}

let currentUtterance: SpeechSynthesisUtterance | null = null

export function speak(text: string): void {
  if (typeof window === 'undefined') return
  if (isMuted()) return
  if (!('speechSynthesis' in window)) return

  stopSpeech()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'fr-FR'
  utterance.rate = 0.9
  utterance.pitch = 1
  utterance.volume = 1

  // Try to pick a French voice
  const voices = window.speechSynthesis.getVoices()
  const frVoice = voices.find(v => v.lang.startsWith('fr'))
  if (frVoice) utterance.voice = frVoice

  currentUtterance = utterance
  window.speechSynthesis.speak(utterance)
}

export function stopSpeech(): void {
  if (typeof window === 'undefined') return
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  currentUtterance = null
}
