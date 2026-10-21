'use client'

import { motion } from 'framer-motion'
import { Search, Sun } from 'lucide-react'
import { useMemo } from 'react'
import { useOS } from '@/lib/phone/store'
import type { AppId } from '@/lib/phone/types'
import { AppIcon } from './app-icon'

const GRID_APPS: AppId[] = ['mail', 'calendar', 'clock', 'notes', 'music', 'settings', 'line', 'instagram']
const DOCK_APPS: AppId[] = ['phone', 'safari', 'line', 'instagram']

export function useBadges(): Partial<Record<AppId, number>> {
  const { state } = useOS()
  return useMemo(
    () => ({
      line: state.line.chats.reduce((s, c) => s + c.unread, 0),
      mail: state.mail.filter((m) => m.unread && m.folder === 'inbox').length,
      phone: state.phone.recents.filter((r) => r.kind === 'missed').length,
      instagram: state.instagram.badge,
    }),
    [state.line.chats, state.mail, state.phone.recents, state.instagram.badge],
  )
}

export function HomeScreen() {
  const { state, openApp } = useOS()
  const badges = useBadges()
  const w = state.device.weather

  const todayEvents = state.calendar.filter((e) => e.date === '2026-10-20')

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ scale: 1.15, opacity: 0 }}
      animate={{ scale: state.device.openApp ? 0.92 : 1, opacity: 1 }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
    >
      <div className="flex flex-1 flex-col px-[22px] pt-[66px]">
        <div className="grid grid-cols-2 gap-[22px]">
          <button
            onClick={() => openApp('settings')}
            className="flex aspect-square flex-col rounded-[22px] bg-gradient-to-b from-[#2E8BEA] to-[#69B4F4] p-3.5 text-left text-white shadow-lg active:scale-95 transition-transform"
            aria-label={`Weather in ${w.city}: ${w.temp} degrees, ${w.condition}`}
          >
            <span className="text-[15px] font-semibold">{w.city}</span>
            <span className="text-[44px] leading-none font-light">{w.temp}°</span>
            <span className="mt-auto">
              <Sun className="mb-1 size-4 fill-[#FFD60A] text-[#FFD60A]" />
              <span className="block text-[13px] font-semibold">{w.condition}</span>
              <span className="block text-[13px] font-medium">
                H:{w.high}° L:{w.low}°
              </span>
            </span>
          </button>

          <button
            onClick={() => openApp('calendar')}
            className="flex aspect-square flex-col rounded-[22px] bg-white p-3.5 text-left shadow-lg active:scale-95 transition-transform"
            aria-label="Calendar, Tuesday October 20"
          >
            <span className="text-[11px] font-bold tracking-wide text-[#FF3B30]">TUESDAY</span>
            <span className="text-[44px] leading-none font-light text-black">20</span>
            <div className="mt-auto flex flex-col gap-1">
              {todayEvents.length === 0 && <span className="text-[12px] text-black/50">No events today</span>}
              {todayEvents.slice(0, 2).map((e) => (
                <div key={e.id} className="flex gap-1.5">
                  <span className="w-[3px] rounded-full" style={{ backgroundColor: e.color }} />
                  <div className="min-w-0">
                    <p className="truncate text-[12px] font-semibold text-black">{e.title}</p>
                    <p className="text-[11px] text-black/50">{e.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </button>
          <span className="col-span-2 -mt-4 flex justify-around text-[11.5px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
            <span>Weather</span>
            <span>Calendar</span>
          </span>
        </div>

        <div className="mt-3 grid grid-cols-4 gap-y-[22px]">
          {GRID_APPS.map((app) => (
            <AppIcon key={`grid-${app}`} app={app} badge={badges[app]} onOpen={() => openApp(app)} />
          ))}
        </div>

        <button
          className="mx-auto mt-auto mb-3 flex items-center gap-1 rounded-full bg-white/25 px-3 py-1.5 text-[13px] font-medium text-white backdrop-blur-xl"
          onClick={() => openApp('safari')}
        >
          <Search className="size-3.5" strokeWidth={2.6} />
          Search
        </button>
      </div>

      <div className="mx-[13px] mb-[14px] flex justify-around rounded-[32px] bg-white/25 px-3 py-[15px] backdrop-blur-2xl">
        {DOCK_APPS.map((app) => (
          <AppIcon key={`dock-${app}`} app={app} badge={badges[app]} showLabel={false} onOpen={() => openApp(app)} />
        ))}
      </div>
    </motion.div>
  )
}
