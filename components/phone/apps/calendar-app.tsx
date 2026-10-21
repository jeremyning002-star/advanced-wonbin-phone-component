'use client'

import { Bell, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'
import type { CalendarEvent } from '@/lib/phone/types'
import { Field, FormGroup, SelectField, Sheet } from '../ui'

const TODAY = '2026-10-20'
const COLORS = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE']
const iso = (y: number, m: number, d: number) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

export function CalendarApp() {
  const { state, update } = useOS()
  const [cursor, setCursor] = useState({ y: 2026, m: 9 })
  const [selected, setSelected] = useState(TODAY)
  const [editing, setEditing] = useState<CalendarEvent | null>(null)

  const days = useMemo(() => {
    const first = new Date(cursor.y, cursor.m, 1).getDay()
    const count = new Date(cursor.y, cursor.m + 1, 0).getDate()
    return [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)] as (number | null)[]
  }, [cursor])

  const monthLabel = new Date(cursor.y, cursor.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const dayEvents = state.calendar.filter((e) => e.date === selected).sort((a, b) => a.time.localeCompare(b.time))
  const shift = (d: number) =>
    setCursor(({ y, m }) => {
      const n = new Date(y, m + d, 1)
      return { y: n.getFullYear(), m: n.getMonth() }
    })

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <div className="flex-1 overflow-y-auto pt-[54px]">
        <div className="flex items-center justify-between px-4 py-2 text-[#FF3B30]">
          <button onClick={() => shift(-1)} aria-label="Previous month" className="flex items-center text-[17px]">
            <ChevronLeft className="size-6" />
          </button>
          <button onClick={() => (setCursor({ y: 2026, m: 9 }), setSelected(TODAY))} className="text-[17px]">
            Today
          </button>
          <button onClick={() => shift(1)} aria-label="Next month">
            <ChevronRight className="size-6" />
          </button>
          <button
            onClick={() => setEditing({ id: 'new', title: '', date: selected, time: '09:00', notes: '', kind: 'event', color: COLORS[1] })}
            aria-label="Add event"
          >
            <Plus className="size-6" />
          </button>
        </div>
        <h1 className="px-4 text-[30px] font-bold">{monthLabel}</h1>
        <div className="mt-2 grid grid-cols-7 px-2 text-center text-[11px] font-semibold text-black/40">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-y-1 px-2">
          {days.map((d, i) => {
            if (!d) return <span key={`e${i}`} />
            const key = iso(cursor.y, cursor.m, d)
            const has = state.calendar.some((e) => e.date === key)
            const isToday = key === TODAY
            const isSel = key === selected
            return (
              <button key={key} onClick={() => setSelected(key)} className="flex flex-col items-center gap-0.5 py-1" aria-pressed={isSel}>
                <span
                  className={`grid size-9 place-items-center rounded-full text-[18px] ${
                    isSel ? (isToday ? 'bg-[#FF3B30] font-semibold text-white' : 'bg-black font-semibold text-white') : isToday ? 'font-semibold text-[#FF3B30]' : ''
                  }`}
                >
                  {d}
                </span>
                <span className={`size-1.5 rounded-full ${has ? 'bg-black/30' : ''}`} />
              </button>
            )
          })}
        </div>

        <div className="mt-3 border-t border-black/10 px-4 pt-3">
          <p className="text-[13px] font-semibold text-black/50">
            {new Date(selected + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <ul className="mt-2 flex flex-col gap-2 pb-6">
            {dayEvents.map((e) => (
              <li key={e.id}>
                <button onClick={() => setEditing(e)} className="flex w-full gap-3 rounded-lg p-2 text-left active:bg-black/5" style={{ backgroundColor: `${e.color}14` }}>
                  <span className="w-1 rounded-full" style={{ backgroundColor: e.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 text-[15px] font-semibold">
                      {e.kind === 'reminder' && <Bell className="size-3.5" />}
                      {e.title}
                    </p>
                    {e.notes && <p className="truncate text-[13px] text-black/50">{e.notes}</p>}
                  </div>
                  <span className="text-[13px] text-black/50">{e.time}</span>
                </button>
              </li>
            ))}
            {dayEvents.length === 0 && <li className="py-6 text-center text-[15px] text-black/40">No Events</li>}
          </ul>
        </div>
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'new' ? 'New Event' : 'Edit Event'}
        saveLabel={editing?.id === 'new' ? 'Add' : 'Save'}
        onSave={() => {
          if (!editing || !editing.title.trim()) return
          update('calendar', (cs) =>
            editing.id === 'new' ? [...cs, { ...editing, id: uid() }] : cs.map((c) => (c.id === editing.id ? editing : c)),
          )
          setSelected(editing.date)
        }}
        danger={
          editing && editing.id !== 'new'
            ? { label: 'Delete Event', onClick: () => update('calendar', (cs) => cs.filter((c) => c.id !== editing.id)) }
            : undefined
        }
      >
        {editing && (
          <>
            <FormGroup>
              <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <SelectField
                label="Type"
                value={editing.kind}
                onChange={(v) => setEditing({ ...editing, kind: v })}
                options={[
                  { value: 'event', label: 'Event' },
                  { value: 'reminder', label: 'Reminder' },
                ]}
              />
              <Field label="Date" type="date" value={editing.date} onChange={(v) => setEditing({ ...editing, date: v })} />
              <Field label="Time" type="time" value={editing.time} onChange={(v) => setEditing({ ...editing, time: v })} />
              <Field label="Notes" multiline value={editing.notes} onChange={(v) => setEditing({ ...editing, notes: v })} />
            </FormGroup>
            <div className="flex justify-center gap-3">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setEditing({ ...editing, color: c })}
                  aria-label={`Color ${c}`}
                  className={`size-8 rounded-full ${editing.color === c ? 'ring-2 ring-black ring-offset-2' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </>
        )}
      </Sheet>
    </div>
  )
}
