'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { AlarmClock, Globe, Minus, Plus, Timer, Watch } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'
import { Field, FormGroup, NavHeader, Sheet, TabBar, Toggle } from '../ui'

type Tab = 'world' | 'alarm' | 'stopwatch' | 'timer'
const ORANGE = '#FF9F0A'

export function ClockApp() {
  const [tab, setTab] = useState<Tab>('alarm')
  return (
    <div className="flex h-full flex-col bg-black text-white">
      <div className="flex-1 overflow-y-auto pt-[54px]">
        {tab === 'world' && <WorldClock />}
        {tab === 'alarm' && <Alarms />}
        {tab === 'stopwatch' && <Stopwatch />}
        {tab === 'timer' && <TimerView />}
      </div>
      <TabBar
        dark
        tint={ORANGE}
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'world', label: 'World Clock', icon: <Globe className="size-6" /> },
          { id: 'alarm', label: 'Alarms', icon: <AlarmClock className="size-6" /> },
          { id: 'stopwatch', label: 'Stopwatch', icon: <Watch className="size-6" /> },
          { id: 'timer', label: 'Timers', icon: <Timer className="size-6" /> },
        ]}
      />
    </div>
  )
}

function WorldClock() {
  const { now } = useOS()
  const zones = [
    { city: 'Bangkok', tz: 'Asia/Bangkok' },
    { city: 'Seoul', tz: 'Asia/Seoul' },
    { city: 'London', tz: 'Europe/London' },
    { city: 'New York', tz: 'America/New_York' },
  ]
  return (
    <div>
      <NavHeader large title="World Clock" tint="text-[#FF9F0A]" />
      <ul className="divide-y divide-white/15 px-4">
        {zones.map((z) => (
          <li key={z.city} className="flex items-end justify-between py-3">
            <div>
              <p className="text-[13px] text-white/50">Today</p>
              <p className="text-[22px]">{z.city}</p>
            </div>
            <span className="text-[52px] leading-none font-light tabular-nums">
              {now.toLocaleTimeString('en-GB', { timeZone: z.tz, hour: '2-digit', minute: '2-digit' })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Alarms() {
  const { state, update } = useOS()
  const [editMode, setEditMode] = useState(false)
  const [editing, setEditing] = useState<{ id: string; time: string; label: string } | null>(null)

  const sorted = [...state.alarms].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div>
      <NavHeader
        large
        title="Alarms"
        tint="text-[#FF9F0A]"
        right={
          <button onClick={() => setEditing({ id: 'new', time: '07:00', label: 'Alarm' })} aria-label="Add alarm">
            <Plus className="size-7" />
          </button>
        }
      />
      <div className="-mt-[90px] mb-[50px] px-4">
        <button onClick={() => setEditMode((e) => !e)} className="relative z-10 text-[17px] text-[#FF9F0A]">
          {editMode ? 'Done' : 'Edit'}
        </button>
      </div>
      <h2 className="mt-2 flex items-center gap-1.5 border-b border-white/15 px-4 pb-2 text-[20px] font-semibold">
        <AlarmClock className="size-5" /> Sleep | Wake Up
      </h2>
      <ul className="px-4">
        <AnimatePresence initial={false}>
          {sorted.map((a) => (
            <motion.li
              key={a.id}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 border-b border-white/15 py-2"
            >
              {editMode && (
                <button
                  aria-label={`Delete alarm ${a.time}`}
                  onClick={() => update('alarms', (as) => as.filter((x) => x.id !== a.id))}
                  className="grid size-6 place-items-center rounded-full bg-[#FF3B30]"
                >
                  <Minus className="size-4" strokeWidth={3} />
                </button>
              )}
              <button
                className="flex-1 text-left"
                onClick={() => setEditing({ id: a.id, time: a.time, label: a.label })}
                disabled={!editMode}
              >
                <p className={`text-[56px] leading-tight font-light tabular-nums ${a.enabled ? '' : 'text-white/45'}`}>{a.time}</p>
                <p className={`text-[15px] ${a.enabled ? '' : 'text-white/45'}`}>{a.label}</p>
              </button>
              {!editMode && (
                <Toggle
                  label={`Alarm ${a.time} ${a.label}`}
                  checked={a.enabled}
                  onChange={(v) => update('alarms', (as) => as.map((x) => (x.id === a.id ? { ...x, enabled: v } : x)))}
                />
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'new' ? 'Add Alarm' : 'Edit Alarm'}
        saveLabel="Save"
        onSave={() => {
          if (!editing) return
          update('alarms', (as) =>
            editing.id === 'new'
              ? [...as, { id: uid(), time: editing.time, label: editing.label || 'Alarm', enabled: true }]
              : as.map((x) => (x.id === editing.id ? { ...x, time: editing.time, label: editing.label } : x)),
          )
        }}
        danger={
          editing && editing.id !== 'new'
            ? { label: 'Delete Alarm', onClick: () => update('alarms', (as) => as.filter((x) => x.id !== editing.id)) }
            : undefined
        }
      >
        {editing && (
          <>
            <input
              type="time"
              value={editing.time}
              onChange={(e) => setEditing({ ...editing, time: e.target.value })}
              aria-label="Alarm time"
              className="mx-auto rounded-xl bg-white px-6 py-3 text-center text-[44px] font-light tabular-nums outline-none"
            />
            <FormGroup>
              <Field label="Label" value={editing.label} onChange={(v) => setEditing({ ...editing, label: v })} />
            </FormGroup>
          </>
        )}
      </Sheet>
    </div>
  )
}

const fmtMs = (ms: number) => {
  const m = Math.floor(ms / 60000)
  const s = Math.floor((ms % 60000) / 1000)
  const cs = Math.floor((ms % 1000) / 10)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')},${cs.toString().padStart(2, '0')}`
}

function Stopwatch() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<number[]>([])
  const base = useRef(0)

  useEffect(() => {
    if (!running) return
    const start = Date.now() - base.current
    const id = setInterval(() => {
      base.current = Date.now() - start
      setElapsed(base.current)
    }, 30)
    return () => clearInterval(id)
  }, [running])

  return (
    <div className="flex flex-col items-center px-4">
      <p className="mt-24 text-[80px] font-thin tabular-nums">{fmtMs(elapsed)}</p>
      <div className="mt-10 flex w-full justify-between">
        <button
          onClick={() => (running ? setLaps((l) => [elapsed, ...l]) : (setElapsed(0), (base.current = 0), setLaps([])))}
          className="grid size-20 place-items-center rounded-full bg-[#333] text-[17px] ring-2 ring-[#333] ring-offset-2 ring-offset-black"
        >
          {running ? 'Lap' : 'Reset'}
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className={`grid size-20 place-items-center rounded-full text-[17px] ring-2 ring-offset-2 ring-offset-black ${
            running ? 'bg-[#3A1513] text-[#FF453A] ring-[#3A1513]' : 'bg-[#0A2A12] text-[#30D158] ring-[#0A2A12]'
          }`}
        >
          {running ? 'Stop' : 'Start'}
        </button>
      </div>
      <ul className="mt-6 w-full divide-y divide-white/15 border-t border-white/15">
        {laps.map((l, i) => (
          <li key={i} className="flex justify-between py-2.5 text-[17px] tabular-nums">
            <span>Lap {laps.length - i}</span>
            <span>{fmtMs(l)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TimerView() {
  const { pushNotification } = useOS()
  const [minutes, setMinutes] = useState(1)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (remaining === null) return
    if (remaining <= 0) {
      pushNotification({ app: 'clock', title: 'Timer', message: 'Timer done' })
      setRemaining(null)
      return
    }
    const id = setTimeout(() => setRemaining((r) => (r === null ? null : r - 1)), 1000)
    return () => clearTimeout(id)
  }, [remaining, pushNotification])

  const total = minutes * 60
  const progress = remaining === null ? 1 : remaining / total

  return (
    <div className="flex flex-col items-center px-4">
      <div className="relative mt-12 grid size-64 place-items-center">
        <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#333" strokeWidth="3" />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            stroke={ORANGE}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={289}
            strokeDashoffset={289 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="text-[56px] font-thin tabular-nums">
          {remaining === null
            ? `${minutes.toString().padStart(2, '0')}:00`
            : `${Math.floor(remaining / 60).toString().padStart(2, '0')}:${(remaining % 60).toString().padStart(2, '0')}`}
        </span>
      </div>
      {remaining === null && (
        <div className="mt-6 flex items-center gap-6">
          <button onClick={() => setMinutes((m) => Math.max(1, m - 1))} className="grid size-10 place-items-center rounded-full bg-[#333]" aria-label="Decrease">
            <Minus className="size-5" />
          </button>
          <span className="w-20 text-center text-[17px]">{minutes} min</span>
          <button onClick={() => setMinutes((m) => Math.min(99, m + 1))} className="grid size-10 place-items-center rounded-full bg-[#333]" aria-label="Increase">
            <Plus className="size-5" />
          </button>
        </div>
      )}
      <div className="mt-8 flex w-full justify-between">
        <button onClick={() => setRemaining(null)} className="grid size-20 place-items-center rounded-full bg-[#333] text-[17px]">
          Cancel
        </button>
        <button
          onClick={() => setRemaining((r) => (r === null ? total : r))}
          className="grid size-20 place-items-center rounded-full bg-[#0A2A12] text-[17px] text-[#30D158]"
        >
          Start
        </button>
      </div>
    </div>
  )
}
