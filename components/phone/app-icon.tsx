'use client'

import { Clock3, Compass, Mail, Music, Phone, Settings } from 'lucide-react'
import type { AppId } from '@/lib/phone/types'
import { cn } from '@/lib/utils'

export const APP_NAMES: Record<AppId, string> = {
  line: 'LINE',
  instagram: 'Instagram',
  phone: 'Phone',
  safari: 'Safari',
  notes: 'Notes',
  clock: 'Clock',
  calendar: 'Calendar',
  mail: 'Mail',
  music: 'Music',
  settings: 'Settings',
}

export function AppGlyph({ app, size = 60, day = 20, weekday = 'TUE' }: { app: AppId; size?: number; day?: number; weekday?: string }) {
  const radius = size * 0.225
  const base = 'relative grid shrink-0 place-items-center overflow-hidden shadow-[0_2px_6px_rgba(0,0,0,0.18)]'
  const style = { width: size, height: size, borderRadius: radius }
  const icon = size * 0.55

  switch (app) {
    case 'line':
      return (
        <div className={cn(base, 'bg-[#06C755]')} style={style}>
          <div
            className="relative grid place-items-center bg-white"
            style={{ width: size * 0.72, height: size * 0.6, borderRadius: '50%' }}
          >
            <span className="font-black tracking-tight text-[#06C755]" style={{ fontSize: size * 0.2 }}>
              LINE
            </span>
            <span
              className="absolute bg-white"
              style={{ width: size * 0.12, height: size * 0.12, bottom: -size * 0.03, right: size * 0.16, transform: 'rotate(45deg)' }}
            />
          </div>
        </div>
      )
    case 'instagram':
      return (
        <div
          className={base}
          style={{
            ...style,
            background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)',
          }}
        >
          <div
            className="relative grid place-items-center border-white"
            style={{ width: size * 0.6, height: size * 0.6, borderRadius: size * 0.18, borderWidth: size * 0.06 }}
          >
            <div className="rounded-full border-white" style={{ width: size * 0.26, height: size * 0.26, borderWidth: size * 0.06 }} />
            <div
              className="absolute rounded-full bg-white"
              style={{ width: size * 0.07, height: size * 0.07, top: size * 0.06, right: size * 0.06 }}
            />
          </div>
        </div>
      )
    case 'phone':
      return (
        <div className={cn(base, 'bg-gradient-to-b from-[#5BF675] to-[#0CBD2A]')} style={style}>
          <Phone className="fill-white text-white" style={{ width: icon, height: icon }} strokeWidth={0} />
        </div>
      )
    case 'safari':
      return (
        <div className={cn(base, 'bg-white')} style={style}>
          <div
            className="grid place-items-center rounded-full bg-gradient-to-b from-[#1BC5FB] to-[#1A6FEA]"
            style={{ width: size * 0.82, height: size * 0.82 }}
          >
            <Compass className="text-white" style={{ width: size * 0.7, height: size * 0.7 }} strokeWidth={1.2} />
          </div>
        </div>
      )
    case 'notes':
      return (
        <div className={cn(base, 'bg-white')} style={style}>
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-[#FDD94A] to-[#F8C426]" style={{ height: size * 0.28 }} />
          <div className="absolute inset-x-0 flex flex-col" style={{ top: size * 0.4, gap: size * 0.13 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-black/10" style={{ height: 1 }} />
            ))}
          </div>
        </div>
      )
    case 'clock':
      return (
        <div className={cn(base, 'bg-black')} style={style}>
          <div className="grid place-items-center rounded-full bg-white" style={{ width: size * 0.84, height: size * 0.84 }}>
            <Clock3 className="text-black" style={{ width: size * 0.8, height: size * 0.8 }} strokeWidth={1.4} />
          </div>
        </div>
      )
    case 'calendar':
      return (
        <div className={cn(base, 'flex flex-col bg-white')} style={style}>
          <div className="flex h-full flex-col items-center justify-center">
            <span className="font-semibold text-[#FF3B30]" style={{ fontSize: size * 0.17, lineHeight: 1.2 }}>
              {weekday}
            </span>
            <span className="font-light text-black" style={{ fontSize: size * 0.5, lineHeight: 1 }}>
              {day}
            </span>
          </div>
        </div>
      )
    case 'mail':
      return (
        <div className={cn(base, 'bg-gradient-to-b from-[#1E9BFF] to-[#1162F0]')} style={style}>
          <Mail className="fill-white text-[#1E80FF]" style={{ width: icon * 1.15, height: icon * 1.15 }} strokeWidth={1.4} />
        </div>
      )
    case 'music':
      return (
        <div className={cn(base, 'bg-gradient-to-b from-[#FD5F78] to-[#FB2D47]')} style={style}>
          <Music className="text-white" style={{ width: icon, height: icon }} strokeWidth={2.4} />
        </div>
      )
    case 'settings':
      return (
        <div className={cn(base, 'bg-gradient-to-b from-[#A9A9AE] to-[#7C7C82]')} style={style}>
          <Settings className="text-[#3a3a3c]" style={{ width: size * 0.78, height: size * 0.78 }} strokeWidth={1.4} />
        </div>
      )
  }
}

export function AppIcon({
  app,
  badge,
  onOpen,
  showLabel = true,
  size = 60,
}: {
  app: AppId
  badge?: number
  onOpen: () => void
  showLabel?: boolean
  size?: number
}) {
  return (
    <button onClick={onOpen} className="group flex flex-col items-center gap-1 outline-none" aria-label={APP_NAMES[app]}>
      <div className="relative transition-transform duration-150 group-active:scale-90 group-active:brightness-75">
        <AppGlyph app={app} size={size} />
        {!!badge && badge > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid h-[22px] min-w-[22px] place-items-center rounded-full bg-[#FF3B30] px-1.5 text-[13px] font-medium text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </div>
      {showLabel && (
        <span className="text-[11.5px] font-medium text-white [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">{APP_NAMES[app]}</span>
      )}
    </button>
  )
}
