'use client'

import { Clock, Delete, Grid3x3, Info, Phone, PhoneIncoming, PhoneMissed, PhoneOutgoing, Plus, UserRound } from 'lucide-react'
import { useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'
import type { Contact } from '@/lib/phone/types'
import { Avatar, Field, FormGroup, MediaField, NavHeader, Sheet, TabBar } from '../ui'

type Tab = 'recents' | 'contacts' | 'keypad'

export function PhoneApp() {
  const [tab, setTab] = useState<Tab>('keypad')
  return (
    <div className="flex h-full flex-col bg-white text-black">
      <div className="flex-1 overflow-y-auto pt-[54px]">
        {tab === 'recents' && <Recents />}
        {tab === 'contacts' && <Contacts />}
        {tab === 'keypad' && <Keypad />}
      </div>
      <TabBar
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'recents', label: 'Recents', icon: <Clock className="size-6" /> },
          { id: 'contacts', label: 'Contacts', icon: <UserRound className="size-6" /> },
          { id: 'keypad', label: 'Keypad', icon: <Grid3x3 className="size-6" /> },
        ]}
      />
    </div>
  )
}

function Recents() {
  const { state, update, startCall } = useOS()
  const [filter, setFilter] = useState<'all' | 'missed'>('all')
  const list = state.phone.recents.filter((r) => filter === 'all' || r.kind === 'missed')
  return (
    <div>
      <div className="flex justify-center px-4 pt-2">
        <div className="flex w-48 rounded-lg bg-[#767680]/12 p-0.5 text-[13px] font-semibold">
          {(['all', 'missed'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 rounded-[7px] py-1 capitalize ${filter === f ? 'bg-white shadow-sm' : ''}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <NavHeader large title="Recents" right={<button onClick={() => update('phone', (p) => ({ ...p, recents: [] }))} className="text-[17px]">Clear</button>} />
      <ul className="pl-4">
        {list.map((r) => {
          const Icon = r.kind === 'missed' ? PhoneMissed : r.kind === 'incoming' ? PhoneIncoming : PhoneOutgoing
          return (
            <li key={r.id} className="flex items-center gap-3 border-b border-black/10 py-2 pr-4">
              <Icon className={`size-4 ${r.kind === 'missed' ? 'text-[#FF3B30]' : 'text-black/40'}`} />
              <button className="min-w-0 flex-1 text-left" onClick={() => startCall({ name: r.name, number: r.number, app: 'phone' })}>
                <p className={`truncate text-[17px] font-semibold ${r.kind === 'missed' ? 'text-[#FF3B30]' : ''}`}>{r.name}</p>
                <p className="text-[14px] text-black/50">{r.number}</p>
              </button>
              <span className="text-[14px] text-black/40">{r.date}</span>
              <button
                aria-label={`Remove ${r.name}`}
                onClick={() => update('phone', (p) => ({ ...p, recents: p.recents.filter((x) => x.id !== r.id) }))}
                className="text-[#007AFF]"
              >
                <Info className="size-5" />
              </button>
            </li>
          )
        })}
        {list.length === 0 && <li className="py-16 text-center text-black/40">No Recents</li>}
      </ul>
    </div>
  )
}

function Contacts() {
  const { state, update, startCall, triggerIncomingCall } = useOS()
  const [editing, setEditing] = useState<Contact | null>(null)
  const sorted = [...state.phone.contacts].sort((a, b) => a.name.localeCompare(b.name))

  return (
    <div>
      <NavHeader
        large
        title="Contacts"
        right={
          <button onClick={() => setEditing({ id: 'new', name: '', number: '' })} aria-label="Add contact">
            <Plus className="size-6" />
          </button>
        }
      />
      <ul className="pl-4">
        {sorted.map((c) => (
          <li key={c.id} className="flex items-center gap-3 border-b border-black/10 py-2 pr-4">
            <Avatar src={c.avatar} name={c.name} size={40} />
            <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(c)}>
              <p className="truncate text-[17px]">{c.name}</p>
              <p className="text-[13px] text-black/50">{c.number}</p>
            </button>
            <button
              aria-label={`Call ${c.name}`}
              onClick={() => startCall({ name: c.name, number: c.number, avatar: c.avatar, app: 'phone' })}
              className="grid size-9 place-items-center rounded-full bg-[#34C759]/15 text-[#34C759]"
            >
              <Phone className="size-4 fill-current" strokeWidth={0} />
            </button>
          </li>
        ))}
      </ul>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'new' ? 'New Contact' : 'Edit Contact'}
        saveLabel="Save"
        onSave={() => {
          if (!editing?.name.trim()) return
          update('phone', (p) => ({
            ...p,
            contacts: editing.id === 'new' ? [...p.contacts, { ...editing, id: uid() }] : p.contacts.map((c) => (c.id === editing.id ? editing : c)),
          }))
        }}
        danger={
          editing && editing.id !== 'new'
            ? { label: 'Delete Contact', onClick: () => update('phone', (p) => ({ ...p, contacts: p.contacts.filter((c) => c.id !== editing.id) })) }
            : undefined
        }
      >
        {editing && (
          <>
            <FormGroup>
              <Field label="Name" value={editing.name} onChange={(v) => setEditing({ ...editing, name: v })} />
              <Field label="Phone" type="tel" value={editing.number} onChange={(v) => setEditing({ ...editing, number: v })} />
              <MediaField label="Photo" value={editing.avatar ?? ''} onChange={(v) => setEditing({ ...editing, avatar: v })} />
            </FormGroup>
            {editing.id !== 'new' && (
              <FormGroup label="Simulate">
                <button
                  className="px-4 py-3 text-left text-[16px] text-[#007AFF]"
                  onClick={() => {
                    setEditing(null)
                    setTimeout(() => triggerIncomingCall({ name: editing.name, number: editing.number, avatar: editing.avatar, app: 'phone' }), 400)
                  }}
                >
                  Receive incoming call from {editing.name}
                </button>
              </FormGroup>
            )}
          </>
        )}
      </Sheet>
    </div>
  )
}

const KEYS: [string, string][] = [
  ['1', ''],
  ['2', 'ABC'],
  ['3', 'DEF'],
  ['4', 'GHI'],
  ['5', 'JKL'],
  ['6', 'MNO'],
  ['7', 'PQRS'],
  ['8', 'TUV'],
  ['9', 'WXYZ'],
  ['*', ''],
  ['0', '+'],
  ['#', ''],
]

function Keypad() {
  const { state, startCall } = useOS()
  const [num, setNum] = useState('')
  const match = state.phone.contacts.find((c) => c.number.replace(/\D/g, '') === num.replace(/\D/g, '') && num.length > 3)

  return (
    <div className="flex h-full flex-col items-center pt-10">
      <p className="h-12 text-[38px] tracking-wide tabular-nums">{num}</p>
      <p className="h-6 text-[15px] text-[#007AFF]">{match?.name ?? (num ? 'Add Number' : '')}</p>
      <div className="mt-4 grid grid-cols-3 gap-x-6 gap-y-3.5">
        {KEYS.map(([k, l]) => (
          <button
            key={k}
            onClick={() => setNum((n) => (n + k).slice(0, 15))}
            className="flex size-[78px] flex-col items-center justify-center rounded-full bg-[#E5E5EA] active:bg-[#BDBDC2]"
            aria-label={k}
          >
            <span className="text-[34px] leading-none">{k}</span>
            {l && <span className="text-[10px] font-semibold tracking-[0.18em] text-black/70">{l}</span>}
          </button>
        ))}
        <span />
        <button
          aria-label="Call"
          disabled={!num}
          onClick={() => {
            startCall({ name: match?.name ?? num, number: num, avatar: match?.avatar, app: 'phone' })
            setNum('')
          }}
          className="grid size-[78px] place-items-center rounded-full bg-[#34C759] active:brightness-90 disabled:opacity-60"
        >
          <Phone className="size-8 fill-white text-white" strokeWidth={0} />
        </button>
        {num ? (
          <button onClick={() => setNum((n) => n.slice(0, -1))} aria-label="Delete digit" className="grid place-items-center text-black/40">
            <Delete className="size-7" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  )
}
