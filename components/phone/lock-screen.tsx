'use client'

import { motion } from 'framer-motion'
import { Camera, Flashlight, Lock } from 'lucide-react'
import { useState } from 'react'
import { useDisplayTime, useOS } from '@/lib/phone/store'
import { AppGlyph, APP_NAMES } from './app-icon'

export function LockScreen() {
  const { state, update } = useOS()
  const { time, date } = useDisplayTime()
  const [torch, setTorch] = useState(false)

  const goPasscode = () => update('device', (d) => ({ ...d, screen: 'passcode' }))

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col text-white"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80 || info.velocity.y < -500) goPasscode()
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ y: '-100%', opacity: 0, transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] } }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${state.device.wallpaper})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/10" aria-hidden />
      {torch && <div className="pointer-events-none absolute inset-0 bg-white/20" aria-hidden />}

      <div className="relative flex flex-1 flex-col items-center pt-[62px]">
        <Lock className="size-5" strokeWidth={2.5} aria-label="Locked" />
        <p className="mt-2 text-[21px] font-semibold opacity-90 [text-shadow:0_1px_6px_rgba(0,0,0,0.15)]">{date}</p>
        <p className="-mt-2 text-[96px] leading-none font-bold tracking-tight tabular-nums [text-shadow:0_2px_20px_rgba(0,0,0,0.15)]">
          {time}
        </p>

        <div className="mt-auto mb-4 flex w-full flex-col gap-2 px-3">
          {state.notifications.slice(0, 3).map((n, i) => (
            <motion.button
              key={n.id}
              onClick={goPasscode}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1 - i * 0.0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-center gap-3 rounded-[22px] bg-white/30 p-3 text-left text-black backdrop-blur-2xl"
            >
              <AppGlyph app={n.app} size={38} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="truncate text-[15px] font-semibold">{n.title}</span>
                  <span className="text-[13px] text-black/50">{n.time}</span>
                </div>
                <p className="truncate text-[15px] leading-tight">{n.message}</p>
                <span className="sr-only">from {APP_NAMES[n.app]}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="relative flex items-center justify-between px-12 pb-3">
        <button
          onClick={() => setTorch((t) => !t)}
          aria-pressed={torch}
          aria-label="Flashlight"
          className={`grid size-[50px] place-items-center rounded-full backdrop-blur-xl transition-colors active:scale-110 ${torch ? 'bg-white text-black' : 'bg-black/30'}`}
        >
          <Flashlight className="size-5" />
        </button>
        <button aria-label="Camera" className="grid size-[50px] place-items-center rounded-full bg-black/30 backdrop-blur-xl active:scale-110">
          <Camera className="size-5" />
        </button>
      </div>
      <button onClick={goPasscode} className="relative flex flex-col items-center gap-2 pb-2">
        <span className="text-[13px] font-medium opacity-80">Swipe up to open</span>
        <motion.span
          className="h-[5px] w-[134px] rounded-full bg-white"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </button>
    </motion.div>
  )
}
