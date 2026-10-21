'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Archive, Mail, MailOpen, Pencil, Reply, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { formatClock, uid, useOS } from '@/lib/phone/store'
import type { MailItem } from '@/lib/phone/types'
import { Avatar, Field, FormGroup, NavHeader, Sheet, Toggle } from '../ui'

type Draft = Omit<MailItem, 'id'>
const empty: Draft = { from: '', email: '', subject: '', body: '', date: '', unread: true, folder: 'inbox' }

export function MailApp() {
  const { state, update } = useOS()
  const [folder, setFolder] = useState<'inbox' | 'sent'>('inbox')
  const [openId, setOpenId] = useState<string | null>(null)
  const [editing, setEditing] = useState<{ id: string | 'new' | 'compose'; draft: Draft } | null>(null)

  const list = state.mail.filter((m) => m.folder === folder)
  const open = state.mail.find((m) => m.id === openId)
  const unread = state.mail.filter((m) => m.unread && m.folder === 'inbox').length

  const patch = (id: string, p: Partial<MailItem>) => update('mail', (ms) => ms.map((m) => (m.id === id ? { ...m, ...p } : m)))

  const save = () => {
    if (!editing) return
    const d = editing.draft
    if (editing.id === 'compose') {
      update('mail', (ms) => [
        { ...d, id: uid(), from: d.from || 'Me', folder: 'sent', unread: false, date: formatClock(new Date(), true) },
        ...ms,
      ])
    } else if (editing.id === 'new') {
      update('mail', (ms) => [{ ...d, id: uid(), date: d.date || formatClock(new Date(), true) }, ...ms])
    } else {
      patch(editing.id, d)
    }
  }

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <div className="flex-1 overflow-y-auto pt-[54px]">
        <NavHeader
          large
          title={folder === 'inbox' ? 'Inbox' : 'Sent'}
          right={
            <button
              className="text-[17px]"
              onClick={() => setEditing({ id: 'new', draft: { ...empty, date: formatClock(new Date(), true) } })}
            >
              Add incoming
            </button>
          }
        />
        <div className="mx-4 mb-2 flex rounded-lg bg-[#767680]/12 p-0.5 text-[13px] font-semibold">
          {(['inbox', 'sent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFolder(f)}
              className={`flex-1 rounded-[7px] py-1 capitalize ${folder === f ? 'bg-white shadow-sm' : ''}`}
            >
              {f}
            </button>
          ))}
        </div>
        <ul>
          {list.map((m) => (
            <li key={m.id} className="border-b border-black/10">
              <button
                onClick={() => {
                  setOpenId(m.id)
                  patch(m.id, { unread: false })
                }}
                className="flex w-full gap-2 px-4 py-2.5 text-left active:bg-black/5"
              >
                <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${m.unread ? 'bg-[#007AFF]' : ''}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <span className="truncate text-[16px] font-semibold">{m.from}</span>
                    <span className="shrink-0 text-[14px] text-black/40">{m.date}</span>
                  </div>
                  <p className="truncate text-[15px]">{m.subject}</p>
                  <p className="line-clamp-2 text-[14px] text-black/50">{m.body}</p>
                </div>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-20 text-center text-black/40">No Mail</li>}
        </ul>
      </div>

      <footer className="flex items-center justify-between border-t border-black/10 bg-[#F9F9F9]/95 px-5 pt-2 pb-8 backdrop-blur">
        <span className="w-6" />
        <span className="text-[11px] text-black/60">{unread > 0 ? `${unread} Unread` : 'Updated Just Now'}</span>
        <button onClick={() => setEditing({ id: 'compose', draft: { ...empty, from: 'Me' } })} aria-label="Compose" className="text-[#007AFF]">
          <SquarePen className="size-6" />
        </button>
      </footer>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col bg-white"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="pt-[54px]">
              <NavHeader
                onBack={() => setOpenId(null)}
                backLabel="Inbox"
                right={
                  <button
                    aria-label="Edit email"
                    onClick={() => {
                      const { id: _id, ...draft } = open
                      setEditing({ id: open.id, draft })
                    }}
                  >
                    <Pencil className="size-5" />
                  </button>
                }
              />
            </div>
            <div className="flex-1 overflow-y-auto px-4">
              <div className="flex items-center gap-3 border-b border-black/10 pb-3">
                <Avatar name={open.from} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold">{open.from}</span>
                    <span className="text-[14px] text-black/40">{open.date}</span>
                  </div>
                  <p className="truncate text-[14px] text-black/50">{open.email}</p>
                </div>
              </div>
              <h2 className="py-3 text-[20px] font-semibold">{open.subject}</h2>
              <p className="pb-8 text-[16px] leading-relaxed whitespace-pre-wrap">{open.body}</p>
            </div>
            <footer className="flex justify-around border-t border-black/10 pt-2 pb-8 text-[#007AFF]">
              <button
                aria-label={open.unread ? 'Mark as read' : 'Mark as unread'}
                onClick={() => patch(open.id, { unread: !open.unread })}
              >
                {open.unread ? <MailOpen className="size-6" /> : <Mail className="size-6" />}
              </button>
              <button aria-label="Archive" onClick={() => setOpenId(null)}>
                <Archive className="size-6" />
              </button>
              <button
                aria-label="Delete"
                onClick={() => {
                  update('mail', (ms) => ms.filter((m) => m.id !== open.id))
                  setOpenId(null)
                }}
              >
                <Trash2 className="size-6" />
              </button>
              <button
                aria-label="Reply"
                onClick={() => setEditing({ id: 'compose', draft: { ...empty, from: 'Me', email: open.email, subject: `Re: ${open.subject}` } })}
              >
                <Reply className="size-6" />
              </button>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'compose' ? 'New Message' : editing?.id === 'new' ? 'Incoming Email' : 'Edit Email'}
        saveLabel={editing?.id === 'compose' ? 'Send' : 'Save'}
        onSave={save}
      >
        {editing && (
          <FormGroup>
            {editing.id === 'compose' ? (
              <Field label="To" value={editing.draft.email} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, email: v } })} />
            ) : (
              <>
                <Field label="Sender" value={editing.draft.from} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, from: v } })} />
                <Field label="Email" value={editing.draft.email} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, email: v } })} />
                <Field label="Date" value={editing.draft.date} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, date: v } })} />
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[15px] text-black/60">Unread</span>
                  <Toggle
                    label="Unread"
                    checked={editing.draft.unread}
                    onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, unread: v } })}
                  />
                </div>
              </>
            )}
            <Field label="Subject" value={editing.draft.subject} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, subject: v } })} />
            <Field label="Body" multiline value={editing.draft.body} onChange={(v) => setEditing({ ...editing, draft: { ...editing.draft, body: v } })} />
          </FormGroup>
        )}
      </Sheet>
    </div>
  )
}
