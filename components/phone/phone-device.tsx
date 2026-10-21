'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { formatClock, useOS } from '@/lib/phone/store'
import type { AppId } from '@/lib/phone/types'
import { CalendarApp } from './apps/calendar-app'
import { ClockApp } from './apps/clock-app'
import { InstagramApp } from './apps/instagram-app'
import { LineApp } from './apps/line-app'
import { MailApp } from './apps/mail-app'
import { MusicApp, MusicEngine } from './apps/music-app'
import { NotesApp } from './apps/notes-app'
import { PhoneApp } from './apps/phone-app'
import { SafariApp } from './apps/safari-app'
import { SettingsApp } from './apps/settings-app'
import { HomeScreen } from './home-screen'
import { LockScreen } from './lock-screen'
import { PasscodeScreen } from './passcode-screen'
import { StatusBar } from './status-bar'
import { ActiveCallScreen, DynamicIsland, IncomingCallScreen, NotificationBanner } from './system-overlays'

const APPS: Record<AppId, ComponentType> = {
  line: LineApp,
  instagram: InstagramApp,
  phone: PhoneApp,
  safari: SafariApp,
  notes: NotesApp,
  clock: ClockApp,
  calendar: CalendarApp,
  mail: MailApp,
  music: MusicApp,
  settings: SettingsApp,
}

const DARK_APPS: AppId[] = ['clock']

export const SCREEN_W = 393
export const SCREEN_H = 852

function AlarmEngine() {
  const { state, now, pushNotification } = useOS()
  const lastFired = useRef('')
  const hhmm = formatClock(now, true)

  useEffect(() => {
    if (lastFired.current === hhmm) return
    const due = state.alarms.find((a) => a.enabled && a.time === hhmm)
    if (due) {
      lastFired.current = hhmm
      pushNotification({ app: 'clock', title: 'Alarm', message: `${due.label} · ${due.time}` })
    }
  }, [hhmm, state.alarms, pushNotification])

  return null
}

export function PhoneDevice({ onIslandClick }: { onIslandClick: () => void }) {
  const { state, openApp } = useOS()
  const { screen, openApp: app, wallpaper } = state.device
  const App = app ? APPS[app] : null
  const statusDark = screen === 'home' && !!app && !DARK_APPS.includes(app) && !state.activeCall && !state.incomingCall

  return (
    <div
      className="relative rounded-[68px] bg-[#1b1b1f] p-[13px] shadow-[0_0_0_2px_#3a3a40,0_40px_80px_-20px_rgba(0,0,0,0.55)]"
      style={{ width: SCREEN_W + 26, height: SCREEN_H + 26 }}
    >
      <span className="absolute top-[150px] -left-[3px] h-8 w-[3px] rounded-l bg-[#2a2a30]" aria-hidden />
      <span className="absolute top-[200px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a2a30]" aria-hidden />
      <span className="absolute top-[270px] -left-[3px] h-14 w-[3px] rounded-l bg-[#2a2a30]" aria-hidden />
      <span className="absolute top-[220px] -right-[3px] h-20 w-[3px] rounded-r bg-[#2a2a30]" aria-hidden />

      <div
        className="relative h-full w-full overflow-hidden rounded-[55px] bg-black select-none"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wallpaper})` }} aria-hidden />

        {screen === 'home' && <HomeScreen />}

        <AnimatePresence>
          {screen === 'home' && App && (
            <motion.div
              key={app}
              className="absolute inset-0 z-30 overflow-hidden"
              initial={{ scale: 0.3, opacity: 0, borderRadius: 60 }}
              animate={{ scale: 1, opacity: 1, borderRadius: 55 }}
              exit={{ scale: 0.3, opacity: 0, borderRadius: 60 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <App />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {screen === 'lock' && <LockScreen key="lock" />}
          {screen === 'passcode' && <PasscodeScreen key="passcode" />}
        </AnimatePresence>

        <StatusBar dark={statusDark} hideTime={screen === 'lock'} />
        <DynamicIsland onClick={onIslandClick} />
        <NotificationBanner />
        <ActiveCallScreen />
        <IncomingCallScreen />

        {screen === 'home' && (
          <HomeIndicator dark={statusDark} onHome={() => openApp(null)} />
        )}
      </div>

      <MusicEngine />
      <AlarmEngine />
    </div>
  )
}

function HomeIndicator({ dark, onHome }: { dark: boolean; onHome: () => void }) {
  return (
    <motion.button
      aria-label="Go to home screen"
      onClick={onHome}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.4}
      onDragEnd={(_, i) => i.offset.y < -30 && onHome()}
      className="absolute bottom-0 left-1/2 z-[70] flex h-6 w-44 -translate-x-1/2 items-end justify-center pb-2"
    >
      <span className={`h-[5px] w-[134px] rounded-full ${dark ? 'bg-black' : 'bg-white'}`} />
    </motion.button>
  )
}

export function useFitScale(padding = 32) {
  const ref = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      setScale(Math.min(1, (width - padding) / (SCREEN_W + 26), (height - padding) / (SCREEN_H + 26)))
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [padding])
  return { ref, scale }
}
