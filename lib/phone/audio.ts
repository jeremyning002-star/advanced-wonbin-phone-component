'use client'

import { useSyncExternalStore } from 'react'

let audio: HTMLAudioElement | null = null

export function getAudio() {
  if (typeof window === 'undefined') return null
  if (!audio) {
    audio = new Audio()
    audio.crossOrigin = 'anonymous'
    audio.preload = 'auto'
  }
  return audio
}

function subscribe(cb: () => void) {
  const el = getAudio()
  if (!el) return () => {}
  const events = ['timeupdate', 'durationchange', 'loadedmetadata', 'play', 'pause', 'ended']
  events.forEach((e) => el.addEventListener(e, cb))
  return () => events.forEach((e) => el.removeEventListener(e, cb))
}

export function useAudioProgress() {
  const current = useSyncExternalStore(subscribe, () => getAudio()?.currentTime ?? 0, () => 0)
  const duration = useSyncExternalStore(subscribe, () => getAudio()?.duration || 0, () => 0)
  return { current, duration }
}

export const fmtTime = (s: number) => {
  if (!Number.isFinite(s)) return '0:00'
  return `${Math.floor(s / 60)}:${Math.floor(s % 60)
    .toString()
    .padStart(2, '0')}`
}
