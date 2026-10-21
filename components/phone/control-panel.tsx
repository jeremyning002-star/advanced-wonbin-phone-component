'use client'

import { BellRing, Lock, PhoneCall, RotateCcw, Smartphone, X } from 'lucide-react'
import { useId, useState, type ReactNode } from 'react'
import { useOS } from '@/lib/phone/store'
import type { AppId, Screen } from '@/lib/phone/types'
import { APP_NAMES, AppGlyph } from './app-icon'

const inputCls =
  'w-full rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-[13px] text-white outline-none placeholder:text-white/30 focus:border-[#0A84FF]'

function Section({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h3 className="mb-3 flex items-center gap-2 text-[12px] font-semibold tracking-wider text-white/50 uppercase">
        {icon}
        {title}
      </h3>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  )
}

function Labeled({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[12px] text-white/60">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

export function ControlPanel({ onReset, onClose }: { onReset: () => void; onClose?: () => void }) {
  const { state, update, openApp, pushNotification, triggerIncomingCall } = useOS()
  const d = state.device
  const [notif, setNotif] = useState<{ app: AppId; title: string; message: string }>({
    app: 'line',
    title: state.line.contacts[0]?.name ?? 'Friend',
    message: 'Are you awake?',
  })
  const [call, setCall] = useState({ name: 'Mom', number: '+66 81 234 5678', app: 'phone' as 'phone' | 'line', video: false })
  const [delay, setDelay] = useState(0)

  const setDevice = (patch: Partial<typeof d>) => update('device', (x) => ({ ...x, ...patch }))
  const later = (fn: () => void) => (delay > 0 ? setTimeout(fn, delay * 1000) : fn())

  const avatarFor = (app: AppId, name: string) =>
    app === 'line' ? state.line.contacts.find((c) => c.name === name)?.avatar : state.phone.contacts.find((c) => c.name === name)?.avatar

  return (
    <div className="flex h-full flex-col text-white">
      <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold">OS Controller</h2>
          <p className="text-[12px] text-white/50">Drive the simulated iPhone</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onReset} className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[12px] text-white/70 hover:bg-white/10" aria-label="Reset simulator">
            <RotateCcw className="size-3.5" /> Reset
          </button>
          {onClose && (
            <button onClick={onClose} className="rounded-md p-1.5 hover:bg-white/10" aria-label="Close controller">
              <X className="size-4" />
            </button>
          )}
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <Section title="Screen" icon={<Lock className="size-3.5" />}>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-white/5 p-1">
            {(['lock', 'passcode', 'home'] as Screen[]).map((s) => (
              <button
                key={s}
                onClick={() => setDevice({ screen: s, openApp: s === 'home' ? d.openApp : null })}
                className={`rounded-md py-1.5 text-[12px] capitalize transition-colors ${d.screen === s ? 'bg-[#0A84FF] text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                {s}
              </button>
            ))}
          </div>
          <p className="text-[12px] text-white/50">
            Passcode: <span className="font-mono text-white/80">{d.passcode}</span> — or tap Face ID.
          </p>
        </Section>

        <Section title="Device" icon={<Smartphone className="size-3.5" />}>
          <div className="flex items-center justify-between text-[13px]">
            <span>Live clock</span>
            <input
              type="checkbox"
              checked={d.clockMode === 'live'}
              onChange={(e) => setDevice({ clockMode: e.target.checked ? 'live' : 'custom' })}
              className="size-4 accent-[#0A84FF]"
              aria-label="Live clock"
            />
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span>24-hour format</span>
            <input type="checkbox" checked={d.hour24} onChange={(e) => setDevice({ hour24: e.target.checked })} className="size-4 accent-[#0A84FF]" aria-label="24-hour format" />
          </div>
          {d.clockMode === 'custom' && (
            <div className="grid grid-cols-2 gap-2">
              <Labeled label="Time">{(id) => <input id={id} className={inputCls} value={d.customTime} onChange={(e) => setDevice({ customTime: e.target.value })} />}</Labeled>
              <Labeled label="Date">{(id) => <input id={id} className={inputCls} value={d.customDate} onChange={(e) => setDevice({ customDate: e.target.value })} />}</Labeled>
            </div>
          )}
          <Labeled label={`Battery — ${d.battery}%`}>
            {(id) => (
              <input id={id} type="range" min={1} max={100} value={d.battery} onChange={(e) => setDevice({ battery: Number(e.target.value) })} className="accent-[#34C759]" />
            )}
          </Labeled>
          <div className="flex items-center justify-between text-[13px]">
            <span>Charging</span>
            <input type="checkbox" checked={d.charging} onChange={(e) => setDevice({ charging: e.target.checked })} className="size-4 accent-[#34C759]" aria-label="Charging" />
          </div>
          <Labeled label="Wallpaper URL">{(id) => <input id={id} className={inputCls} value={d.wallpaper} onChange={(e) => setDevice({ wallpaper: e.target.value })} />}</Labeled>
        </Section>

        <Section title="Push notification" icon={<BellRing className="size-3.5" />}>
          <Labeled label="App">
            {(id) => (
              <select id={id} className={inputCls} value={notif.app} onChange={(e) => setNotif({ ...notif, app: e.target.value as AppId })}>
                {(Object.keys(APP_NAMES) as AppId[]).map((a) => (
                  <option key={a} value={a} className="bg-[#1c1c1e]">
                    {APP_NAMES[a]}
                  </option>
                ))}
              </select>
            )}
          </Labeled>
          <Labeled label={notif.app === 'line' ? 'Sender (match a LINE friend to add to chat)' : 'Title'}>
            {(id) => <input id={id} list="line-friends" className={inputCls} value={notif.title} onChange={(e) => setNotif({ ...notif, title: e.target.value })} />}
          </Labeled>
          <datalist id="line-friends">
            {state.line.contacts.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          <Labeled label="Message">
            {(id) => <textarea id={id} rows={2} className={`${inputCls} resize-none`} value={notif.message} onChange={(e) => setNotif({ ...notif, message: e.target.value })} />}
          </Labeled>
          <button
            onClick={() => later(() => pushNotification({ ...notif, avatar: avatarFor(notif.app, notif.title) }))}
            className="flex items-center justify-center gap-2 rounded-lg bg-[#0A84FF] py-2 text-[13px] font-semibold hover:brightness-110"
          >
            <AppGlyph app={notif.app} size={18} /> Send notification
          </button>
          {state.notifications.length > 0 && (
            <button onClick={() => update('notifications', [])} className="text-[12px] text-white/50 hover:text-white">
              Clear {state.notifications.length} lock-screen notifications
            </button>
          )}
        </Section>

        <Section title="Incoming call" icon={<PhoneCall className="size-3.5" />}>
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-white/5 p-1">
            {(['phone', 'line'] as const).map((a) => (
              <button
                key={a}
                onClick={() => setCall({ ...call, app: a })}
                className={`rounded-md py-1.5 text-[12px] transition-colors ${call.app === a ? 'bg-[#34C759] text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                {a === 'phone' ? 'Cellular' : 'LINE'}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Labeled label="Caller">
              {(id) => <input id={id} list={call.app === 'line' ? 'line-friends' : 'phone-contacts'} className={inputCls} value={call.name} onChange={(e) => setCall({ ...call, name: e.target.value })} />}
            </Labeled>
            <Labeled label="Number">{(id) => <input id={id} className={inputCls} value={call.number} onChange={(e) => setCall({ ...call, number: e.target.value })} />}</Labeled>
          </div>
          <datalist id="phone-contacts">
            {state.phone.contacts.map((c) => (
              <option key={c.id} value={c.name} />
            ))}
          </datalist>
          {call.app === 'line' && (
            <div className="flex items-center justify-between text-[13px]">
              <span>Video call</span>
              <input type="checkbox" checked={call.video} onChange={(e) => setCall({ ...call, video: e.target.checked })} className="size-4 accent-[#34C759]" aria-label="Video call" />
            </div>
          )}
          <button
            onClick={() => later(() => triggerIncomingCall({ ...call, avatar: avatarFor(call.app, call.name) }))}
            className="rounded-lg bg-[#34C759] py-2 text-[13px] font-semibold hover:brightness-110"
          >
            Ring the phone
          </button>
        </Section>

        <Section title="Timing & apps" icon={<Smartphone className="size-3.5" />}>
          <Labeled label={`Delay before trigger — ${delay}s`}>
            {(id) => <input id={id} type="range" min={0} max={10} value={delay} onChange={(e) => setDelay(Number(e.target.value))} className="accent-[#0A84FF]" />}
          </Labeled>
          <div className="grid grid-cols-5 gap-2">
            {(Object.keys(APP_NAMES) as AppId[]).map((a) => (
              <button
                key={a}
                onClick={() => {
                  setDevice({ screen: 'home' })
                  openApp(a)
                }}
                className="flex flex-col items-center gap-1 rounded-lg p-1 hover:bg-white/10"
                title={`Open ${APP_NAMES[a]}`}
              >
                <AppGlyph app={a} size={34} />
                <span className="w-full truncate text-center text-[10px] text-white/60">{APP_NAMES[a]}</span>
              </button>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}
