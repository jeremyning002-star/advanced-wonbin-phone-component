'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Grid3x3, MessageCircle, Mic, MicOff, Phone, PhoneOff, Plus, UserRound, Video, Volume2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useOS } from '@/lib/phone/store'
import { AppGlyph } from './app-icon'
import { Avatar } from './ui'

export function NotificationBanner() {
  const { state, update, openApp } = useOS()
  const banner = state.banner

  useEffect(() => {
    if (!banner) return
    const id = setTimeout(() => update('banner', null), 5000)
    return () => clearTimeout(id)
  }, [banner, update])

  return (
    <AnimatePresence>
      {banner && (
        <motion.button
          key={banner.id}
          initial={{ y: -120, scale: 0.6, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -120, scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={(_, i) => i.offset.y < -30 && update('banner', null)}
          onClick={() => {
            update('banner', null)
            if (state.device.screen === 'home') openApp(banner.app)
            else update('device', (d) => ({ ...d, screen: 'passcode' }))
          }}
          className="absolute inset-x-2 top-[52px] z-[80] flex items-center gap-3 rounded-[22px] bg-white/75 p-3 text-left text-black shadow-2xl backdrop-blur-2xl"
        >
          <div className="relative">
            {banner.avatar ? <Avatar src={banner.avatar} name={banner.title} size={38} /> : <AppGlyph app={banner.app} size={38} />}
            {banner.avatar && (
              <span className="absolute -right-1 -bottom-1">
                <AppGlyph app={banner.app} size={18} />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between">
              <span className="truncate text-[15px] font-semibold">{banner.title}</span>
              <span className="text-[13px] text-black/50">now</span>
            </div>
            <p className="line-clamp-2 text-[15px] leading-tight">{banner.message}</p>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

export function IncomingCallScreen() {
  const { state, answerCall, declineCall } = useOS()
  const call = state.incomingCall

  return (
    <AnimatePresence>
      {call && (
        <motion.div
          className="absolute inset-0 z-[90] flex flex-col items-center overflow-hidden text-white"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05 }}
        >
          <div
            className="absolute inset-0 scale-125 bg-cover bg-center blur-3xl"
            style={{ backgroundImage: `url(${call.avatar || state.device.wallpaper})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/45" aria-hidden />
          <div className="relative mt-[96px] flex flex-col items-center gap-2 text-center">
            <span className="text-[15px] opacity-70">{call.app === 'line' ? `LINE ${call.video ? 'Video' : 'Audio'}` : 'mobile'}</span>
            <h2 className="text-[34px] leading-tight font-normal">{call.name}</h2>
            <span className="text-[15px] opacity-70">{call.number}</span>
            <motion.div animate={{ scale: [1, 1.06, 1] }} transition={{ repeat: Infinity, duration: 1.6 }} className="mt-8">
              <Avatar src={call.avatar} name={call.name} size={120} className="ring-4 ring-white/20" />
            </motion.div>
          </div>

          <div className="relative mt-auto mb-10 flex w-full justify-between px-12">
            <div className="flex flex-col items-center gap-2">
              <button className="grid size-12 place-items-center rounded-full bg-white/20 backdrop-blur-xl" aria-label="Remind me">
                <Plus className="size-5" />
              </button>
              <span className="text-[12px]">Remind Me</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <button className="grid size-12 place-items-center rounded-full bg-white/20 backdrop-blur-xl" aria-label="Message">
                <MessageCircle className="size-5" />
              </button>
              <span className="text-[12px]">Message</span>
            </div>
          </div>
          <div className="relative mb-16 flex w-full justify-between px-12">
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={declineCall}
                className="grid size-[76px] place-items-center rounded-full bg-[#FF3B30]"
                aria-label="Decline"
              >
                <PhoneOff className="size-8 fill-white" strokeWidth={0} />
              </motion.button>
              <span className="text-[14px]">Decline</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ rotate: [0, -12, 12, -12, 0] }}
                transition={{ repeat: Infinity, duration: 1.2, repeatDelay: 0.6 }}
                onClick={answerCall}
                className="grid size-[76px] place-items-center rounded-full bg-[#34C759]"
                aria-label="Accept"
              >
                <Phone className="size-8 fill-white" strokeWidth={0} />
              </motion.button>
              <span className="text-[14px]">Accept</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function useElapsed(startedAt: number | undefined) {
  const { now } = useOS()
  if (!startedAt) return '00:00'
  const s = Math.max(0, Math.floor((now.getTime() - startedAt) / 1000))
  return `${Math.floor(s / 60)
    .toString()
    .padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
}

export function ActiveCallScreen() {
  const { state, endCall } = useOS()
  const call = state.activeCall
  const elapsed = useElapsed(call?.startedAt)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [camOn, setCamOn] = useState(true)

  const controls = [
    { label: muted ? 'Unmute' : 'Mute', icon: muted ? MicOff : Mic, active: muted, onClick: () => setMuted((m) => !m) },
    { label: 'Keypad', icon: Grid3x3, active: false, onClick: () => {} },
    { label: 'Speaker', icon: Volume2, active: speaker, onClick: () => setSpeaker((s) => !s) },
    { label: 'Add', icon: Plus, active: false, onClick: () => {} },
    { label: 'FaceTime', icon: Video, active: !!call?.video && camOn, onClick: () => setCamOn((c) => !c) },
    { label: 'Contacts', icon: UserRound, active: false, onClick: () => {} },
  ]

  return (
    <AnimatePresence>
      {call && (
        <motion.div
          className="absolute inset-0 z-[85] flex flex-col items-center overflow-hidden text-white"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {call.video && camOn ? (
            <>
              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${call.avatar || state.device.wallpaper})` }} />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/70" />
              <div
                className="absolute top-[110px] right-4 h-[150px] w-[100px] rounded-2xl border border-white/30 bg-cover bg-center shadow-xl"
                style={{ backgroundImage: `url(${state.line.myAvatar})` }}
                aria-label="Your camera preview"
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0 scale-125 bg-cover bg-center blur-3xl"
                style={{ backgroundImage: `url(${call.avatar || state.device.wallpaper})` }}
              />
              <div className="absolute inset-0 bg-black/50" />
            </>
          )}

          <div className="relative mt-[90px] flex flex-col items-center gap-1 text-center">
            {!(call.video && camOn) && <Avatar src={call.avatar} name={call.name} size={96} className="mb-3" />}
            <h2 className="text-[30px] font-normal">{call.name}</h2>
            <span className="text-[17px] tabular-nums opacity-80">
              {call.app === 'line' ? 'LINE · ' : ''}
              {elapsed}
            </span>
          </div>

          <div className="relative mt-auto mb-8 grid grid-cols-3 gap-x-7 gap-y-5">
            {controls.map((c) => (
              <div key={c.label} className="flex flex-col items-center gap-1.5">
                <button
                  onClick={c.onClick}
                  aria-pressed={c.active}
                  aria-label={c.label}
                  className={`grid size-[72px] place-items-center rounded-full backdrop-blur-xl transition-colors ${c.active ? 'bg-white text-black' : 'bg-white/20'}`}
                >
                  <c.icon className="size-7" />
                </button>
                <span className="text-[12px]">{c.label}</span>
              </div>
            ))}
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={endCall}
            className="relative mb-14 grid size-[72px] place-items-center rounded-full bg-[#FF3B30]"
            aria-label="End call"
          >
            <PhoneOff className="size-8 fill-white" strokeWidth={0} />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function DynamicIsland({ onClick }: { onClick: () => void }) {
  const { state } = useOS()
  const call = state.activeCall
  const playing = state.music.playing
  const track = state.music.tracks.find((t) => t.id === state.music.currentId)
  const elapsed = useElapsed(call?.startedAt)
  const expanded = !!call || (playing && !!track)

  return (
    <motion.button
      onClick={onClick}
      aria-label="Dynamic Island — open OS controller"
      className="absolute top-[11px] left-1/2 z-[100] flex h-[37px] -translate-x-1/2 items-center justify-between overflow-hidden rounded-full bg-black px-2.5 text-white"
      animate={{ width: expanded ? 220 : 126 }}
      transition={{ type: 'spring', damping: 20, stiffness: 260 }}
    >
      {call ? (
        <>
          <span className="flex items-center gap-1.5 text-[12px] font-semibold text-[#34C759]">
            <Phone className="size-3.5 fill-[#34C759]" strokeWidth={0} />
            {elapsed}
          </span>
          <span className="flex items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-[#34C759]"
                animate={{ height: [4, 12, 6, 10, 4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.12 }}
              />
            ))}
          </span>
        </>
      ) : expanded && track ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={track.cover} alt="" className="size-6 rounded-md object-cover" />
          <span className="flex items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <motion.span
                key={i}
                className="w-[3px] rounded-full bg-[#FD5F78]"
                animate={{ height: [4, 12, 6, 10, 4] }}
                transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.12 }}
              />
            ))}
          </span>
        </>
      ) : (
        <span className="ml-auto size-2.5 rounded-full bg-[#1a1a2e] ring-1 ring-[#2a2a40]" aria-hidden />
      )}
    </motion.button>
  )
}
