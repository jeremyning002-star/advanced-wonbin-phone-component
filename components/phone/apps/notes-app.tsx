'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Search, SquarePen, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'
import { NavHeader } from '../ui'

const YELLOW = 'text-[#E5A50A]'

export function NotesApp() {
  const { state, update } = useOS()
  const [openId, setOpenId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const note = state.notes.find((n) => n.id === openId)

  const filtered = state.notes.filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()))

  const create = () => {
    const id = uid()
    update('notes', (ns) => [{ id, title: '', body: '', date: 'Today' }, ...ns])
    setOpenId(id)
  }

  const close = () => {
    update('notes', (ns) => ns.filter((n) => n.title.trim() || n.body.trim()))
    setOpenId(null)
  }

  return (
    <div className="relative flex h-full flex-col bg-[#F2F2F7] text-black">
      <div className="flex-1 overflow-y-auto pt-[54px]">
        <NavHeader large title="Notes" tint={YELLOW} />
        <div className="mx-4 mb-4 flex items-center gap-2 rounded-[10px] bg-[#767680]/12 px-2 py-1.5">
          <Search className="size-4 text-black/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search notes"
            className="flex-1 bg-transparent text-[17px] outline-none"
          />
        </div>
        <ul className="mx-4 divide-y divide-black/10 overflow-hidden rounded-[10px] bg-white">
          {filtered.map((n) => (
            <li key={n.id} className="group flex items-center">
              <button onClick={() => setOpenId(n.id)} className="min-w-0 flex-1 px-4 py-2.5 text-left active:bg-black/5">
                <p className="truncate text-[16px] font-semibold">{n.title || 'New Note'}</p>
                <p className="truncate text-[14px] text-black/50">
                  <span className="text-black/70">{n.date}</span> {n.body.split('\n')[0] || 'No additional text'}
                </p>
              </button>
              <button
                aria-label={`Delete ${n.title}`}
                onClick={() => update('notes', (ns) => ns.filter((x) => x.id !== n.id))}
                className="px-4 text-[#FF3B30] opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              >
                <Trash2 className="size-5" />
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-4 py-6 text-center text-black/40">No Notes</li>}
        </ul>
      </div>
      <footer className="flex items-center justify-between border-t border-black/10 bg-[#F9F9F9]/95 px-5 pt-2 pb-8">
        <span className="w-6" />
        <span className="text-[11px] text-black/60">{state.notes.length} Notes</span>
        <button onClick={create} aria-label="New note" className={YELLOW}>
          <SquarePen className="size-6" />
        </button>
      </footer>

      <AnimatePresence>
        {note && (
          <motion.div
            className="absolute inset-0 z-20 flex flex-col bg-white"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="pt-[54px]">
              <NavHeader
                onBack={close}
                backLabel="Notes"
                tint={YELLOW}
                right={
                  <>
                    <button
                      aria-label="Delete note"
                      onClick={() => {
                        update('notes', (ns) => ns.filter((x) => x.id !== note.id))
                        setOpenId(null)
                      }}
                    >
                      <Trash2 className="size-5" />
                    </button>
                    <button onClick={close} className="text-[17px] font-semibold">
                      Done
                    </button>
                  </>
                }
              />
            </div>
            <div className="flex flex-1 flex-col overflow-y-auto px-5">
              <input
                value={note.date}
                onChange={(e) => update('notes', (ns) => ns.map((n) => (n.id === note.id ? { ...n, date: e.target.value } : n)))}
                aria-label="Note date"
                className="mb-2 bg-transparent text-center text-[13px] text-black/40 outline-none"
              />
              <input
                autoFocus={!note.title}
                value={note.title}
                onChange={(e) => update('notes', (ns) => ns.map((n) => (n.id === note.id ? { ...n, title: e.target.value } : n)))}
                placeholder="Title"
                aria-label="Note title"
                className="bg-transparent text-[26px] font-bold outline-none"
              />
              <textarea
                value={note.body}
                onChange={(e) => update('notes', (ns) => ns.map((n) => (n.id === note.id ? { ...n, body: e.target.value } : n)))}
                placeholder="Start writing..."
                aria-label="Note body"
                className="mt-2 flex-1 resize-none bg-transparent text-[17px] leading-relaxed outline-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
