'use client'

import { Wifi } from 'lucide-react'
import { useDisplayTime, useOS } from '@/lib/phone/store'
import { cn } from '@/lib/utils'

function SignalBars() {
  return (
    <div className="flex items-end gap-[1.5px]" aria-label="Cellular signal full">
      {[4, 6, 8.5, 11].map((h) => (
        <span key={h} className="w-[3px] rounded-[1px] bg-current" style={{ height: h }} />
      ))}
    </div>
  )
}

function Battery({ level, charging }: { level: number; charging: boolean }) {
  const low = level <= 20
  return (
    <div className="flex items-center gap-[1px]" aria-label={`Battery ${level}%`}>
      <div className="relative h-[12.5px] w-[25px] rounded-[4px] border border-current/40 p-[1.5px]">
        <div
          className={cn('h-full rounded-[2px]', charging ? 'bg-[#34C759]' : low ? 'bg-[#FF3B30]' : 'bg-current')}
          style={{ width: `${Math.max(6, level)}%` }}
        />
        <span className="absolute inset-0 grid place-items-center text-[8.5px] font-bold mix-blend-difference text-white">
          {level}
        </span>
      </div>
      <span className="h-[4px] w-[1.5px] rounded-r-sm bg-current/40" />
    </div>
  )
}

export function StatusBar({ dark = false, hideTime = false }: { dark?: boolean; hideTime?: boolean }) {
  const { state } = useOS()
  const { time } = useDisplayTime()
  const d = state.device

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-0 top-0 z-40 flex h-[54px] items-center justify-between px-8 pt-1.5 text-[16px] font-semibold',
        dark ? 'text-black' : 'text-white',
      )}
    >
      <span className="w-[90px] text-center tabular-nums">{hideTime ? '' : time}</span>
      <div className="flex w-[90px] items-center justify-center gap-[5px]">
        <SignalBars />
        <Wifi className="size-[17px]" strokeWidth={2.8} />
        <Battery level={d.battery} charging={d.charging} />
      </div>
    </div>
  )
}
