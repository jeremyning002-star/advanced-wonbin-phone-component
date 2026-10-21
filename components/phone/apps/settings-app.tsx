'use client'

import { BatteryFull, Clock, CloudSun, ImageIcon, KeyRound, Signal } from 'lucide-react'
import type { ReactNode } from 'react'
import { useOS } from '@/lib/phone/store'
import { Field, FormGroup, MediaField, NavHeader, SelectField, Toggle } from '../ui'

function Row({ icon, color, label, children }: { icon: ReactNode; color: string; label: string; children?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="grid size-[29px] shrink-0 place-items-center rounded-[7px] text-white" style={{ backgroundColor: color }}>
        {icon}
      </span>
      <span className="flex-1 text-[16px]">{label}</span>
      {children}
    </div>
  )
}

export function SettingsApp() {
  const { state, update } = useOS()
  const d = state.device
  const set = (patch: Partial<typeof d>) => update('device', (x) => ({ ...x, ...patch }))

  return (
    <div className="h-full overflow-y-auto bg-[#F2F2F7] pt-[54px] pb-10 text-black">
      <NavHeader large title="Settings" />
      <div className="flex flex-col gap-6 px-4">
        <FormGroup>
          <Row icon={<Signal className="size-4" />} color="#34C759" label="Carrier">
            <input
              value={d.carrier}
              onChange={(e) => set({ carrier: e.target.value })}
              aria-label="Carrier"
              className="w-28 bg-transparent text-right text-black/50 outline-none"
            />
          </Row>
          <Row icon={<BatteryFull className="size-4" />} color="#34C759" label={`Battery ${d.battery}%`}>
            <input
              type="range"
              min={1}
              max={100}
              value={d.battery}
              onChange={(e) => set({ battery: Number(e.target.value) })}
              aria-label="Battery level"
              className="w-28 accent-[#34C759]"
            />
          </Row>
          <Row icon={<BatteryFull className="size-4" />} color="#FFCC00" label="Charging">
            <Toggle label="Charging" checked={d.charging} onChange={(v) => set({ charging: v })} />
          </Row>
        </FormGroup>

        <FormGroup label="Date & Time">
          <Row icon={<Clock className="size-4" />} color="#8E8E93" label="Set Automatically">
            <Toggle label="Live clock" checked={d.clockMode === 'live'} onChange={(v) => set({ clockMode: v ? 'live' : 'custom' })} />
          </Row>
          <Row icon={<Clock className="size-4" />} color="#8E8E93" label="24-Hour Time">
            <Toggle label="24-hour time" checked={d.hour24} onChange={(v) => set({ hour24: v })} />
          </Row>
          {d.clockMode === 'custom' && (
            <>
              <Field label="Time" value={d.customTime} onChange={(v) => set({ customTime: v })} />
              <Field label="Date" value={d.customDate} onChange={(v) => set({ customDate: v })} />
            </>
          )}
        </FormGroup>

        <FormGroup label="Wallpaper">
          <div className="flex gap-3 px-4 py-3">
            <div className="h-36 w-[68px] rounded-lg bg-cover bg-center shadow" style={{ backgroundImage: `url(${d.wallpaper})` }} />
            <div className="flex flex-1 items-center gap-2 text-[14px] text-black/60">
              <ImageIcon className="size-4" /> Lock & Home Screen
            </div>
          </div>
          <MediaField label="Image" value={d.wallpaper} onChange={(v) => set({ wallpaper: v })} />
        </FormGroup>

        <FormGroup label="Weather widget">
          <Row icon={<CloudSun className="size-4" />} color="#007AFF" label="City">
            <input
              value={d.weather.city}
              onChange={(e) => set({ weather: { ...d.weather, city: e.target.value } })}
              aria-label="City"
              className="w-28 bg-transparent text-right text-black/50 outline-none"
            />
          </Row>
          <Field label="Temp °" type="number" value={d.weather.temp} onChange={(v) => set({ weather: { ...d.weather, temp: Number(v) || 0 } })} />
          <SelectField
            label="Condition"
            value={d.weather.condition}
            onChange={(v) => set({ weather: { ...d.weather, condition: v } })}
            options={['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm', 'Clear'].map((c) => ({ value: c, label: c }))}
          />
          <Field label="High °" type="number" value={d.weather.high} onChange={(v) => set({ weather: { ...d.weather, high: Number(v) || 0 } })} />
          <Field label="Low °" type="number" value={d.weather.low} onChange={(v) => set({ weather: { ...d.weather, low: Number(v) || 0 } })} />
        </FormGroup>

        <FormGroup label="Face ID & Passcode">
          <Row icon={<KeyRound className="size-4" />} color="#FF3B30" label="Passcode">
            <input
              inputMode="numeric"
              value={d.passcode}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                if (v.length >= 4 || v.length < d.passcode.length) set({ passcode: v })
              }}
              aria-label="Passcode"
              className="w-24 bg-transparent text-right tracking-[0.3em] text-black/50 outline-none"
            />
          </Row>
          <button className="px-4 py-3 text-left text-[16px] text-[#007AFF]" onClick={() => set({ screen: 'lock', openApp: null })}>
            Lock iPhone
          </button>
        </FormGroup>
      </div>
    </div>
  )
}
