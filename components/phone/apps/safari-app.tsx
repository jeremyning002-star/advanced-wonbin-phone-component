'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ChevronLeft, ChevronRight, Copy, Lock, Plus, RotateCw, Search, Share, Star, X } from 'lucide-react'
import { useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'

const normalize = (raw: string) => raw.trim().replace(/^https?:\/\//, '').replace(/\/$/, '')
const isUrl = (raw: string) => /\.[a-z]{2,}/i.test(raw) && !raw.includes(' ')
const titleFor = (url: string) => {
  if (!url) return 'Start Page'
  if (url.startsWith('search?q=')) return decodeURIComponent(url.slice(9))
  const host = url.split('/')[0].replace(/^www\./, '')
  const name = host.split('.')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

const PALETTE = ['#0A84FF', '#FF375F', '#30D158', '#FF9F0A', '#BF5AF2', '#64D2FF']
const colorFor = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length]

export function SafariApp() {
  const { state, update } = useOS()
  const safari = state.safari
  const tab = safari.tabs.find((t) => t.id === safari.activeTabId) ?? safari.tabs[0]
  const [address, setAddress] = useState('')
  const [focused, setFocused] = useState(false)
  const [showTabs, setShowTabs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState<Record<string, { back: string[]; fwd: string[] }>>({})

  const navigate = (raw: string) => {
    const value = raw.trim()
    if (!value) return
    const url = isUrl(value) ? normalize(value) : `search?q=${encodeURIComponent(value)}`
    setHistory((h) => ({ ...h, [tab.id]: { back: [...(h[tab.id]?.back ?? []), tab.url], fwd: [] } }))
    update('safari', (s) => ({ ...s, tabs: s.tabs.map((t) => (t.id === tab.id ? { ...t, url, title: titleFor(url) } : t)) }))
    setFocused(false)
    setLoading(true)
    setTimeout(() => setLoading(false), 600)
  }

  const go = (dir: 'back' | 'fwd') => {
    const h = history[tab.id]
    if (!h) return
    const stack = dir === 'back' ? h.back : h.fwd
    const target = stack[stack.length - 1]
    if (target === undefined) return
    setHistory((all) => ({
      ...all,
      [tab.id]:
        dir === 'back'
          ? { back: h.back.slice(0, -1), fwd: [...h.fwd, tab.url] }
          : { back: [...h.back, tab.url], fwd: h.fwd.slice(0, -1) },
    }))
    update('safari', (s) => ({ ...s, tabs: s.tabs.map((t) => (t.id === tab.id ? { ...t, url: target, title: titleFor(target) } : t)) }))
  }

  const newTab = () => {
    const id = uid()
    update('safari', (s) => ({ ...s, tabs: [...s.tabs, { id, url: '', title: 'Start Page' }], activeTabId: id }))
    setShowTabs(false)
  }

  const bookmarked = safari.bookmarks.some((b) => b.url === tab.url)

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <div className="relative flex-1 overflow-y-auto pt-[54px]">
        {loading && (
          <motion.div className="absolute top-[54px] left-0 z-10 h-0.5 bg-[#007AFF]" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 0.6 }} />
        )}
        {tab.url ? <MockPage url={tab.url} onNavigate={navigate} /> : <StartPage onNavigate={navigate} />}
      </div>

      <div className="border-t border-black/10 bg-[#F9F9F9]/95 px-3 pt-2 backdrop-blur-xl">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            navigate(address)
          }}
          className="flex h-11 items-center gap-2 rounded-xl bg-white px-3 shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
        >
          {focused ? <Search className="size-4 text-black/40" /> : tab.url && <Lock className="size-3.5 text-black/50" />}
          <input
            value={focused ? address : tab.url.startsWith('search?q=') ? titleFor(tab.url) : tab.url || ''}
            onFocus={() => {
              setFocused(true)
              setAddress(tab.url.startsWith('search?q=') ? titleFor(tab.url) : tab.url)
            }}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search or enter website name"
            aria-label="Address"
            className={`min-w-0 flex-1 bg-transparent text-[16px] outline-none ${focused ? 'text-left' : 'text-center'}`}
          />
          {focused ? (
            address && (
              <button type="button" onClick={() => setAddress('')} aria-label="Clear">
                <X className="size-4 rounded-full bg-black/20 p-0.5 text-white" />
              </button>
            )
          ) : (
            <button
              type="button"
              aria-label="Reload"
              onClick={() => {
                setLoading(true)
                setTimeout(() => setLoading(false), 600)
              }}
            >
              <RotateCw className="size-4 text-black/60" />
            </button>
          )}
        </form>
        <div className="flex items-center justify-between px-2 pt-2.5 pb-7 text-[#007AFF]">
          <button onClick={() => go('back')} disabled={!history[tab.id]?.back.length} className="disabled:opacity-30" aria-label="Back">
            <ChevronLeft className="size-7" />
          </button>
          <button onClick={() => go('fwd')} disabled={!history[tab.id]?.fwd.length} className="disabled:opacity-30" aria-label="Forward">
            <ChevronRight className="size-7" />
          </button>
          <button
            aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
            disabled={!tab.url}
            className="disabled:opacity-30"
            onClick={() =>
              update('safari', (s) => ({
                ...s,
                bookmarks: bookmarked
                  ? s.bookmarks.filter((b) => b.url !== tab.url)
                  : [...s.bookmarks, { id: uid(), title: tab.title, url: tab.url }],
              }))
            }
          >
            {bookmarked ? <Star className="size-6 fill-current" /> : <Share className="size-6" />}
          </button>
          <button aria-label="Bookmarks" onClick={() => navigate('')}>
            <BookOpen className="size-6" />
          </button>
          <button aria-label="Tabs" onClick={() => setShowTabs(true)}>
            <Copy className="size-6" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showTabs && (
          <motion.div
            className="absolute inset-0 z-30 flex flex-col bg-[#E5E5EA]"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
          >
            <div className="grid flex-1 auto-rows-min grid-cols-2 gap-4 overflow-y-auto p-4 pt-[70px]">
              {safari.tabs.map((t) => (
                <div key={t.id} className="flex flex-col gap-1.5">
                  <div
                    className={`relative h-48 overflow-hidden rounded-xl bg-white shadow ${t.id === tab.id ? 'ring-[3px] ring-[#007AFF]' : ''}`}
                  >
                    <button
                      className="absolute inset-0 overflow-hidden p-2 text-left"
                      onClick={() => {
                        update('safari', (s) => ({ ...s, activeTabId: t.id }))
                        setShowTabs(false)
                      }}
                    >
                      <div className="h-16 rounded-md" style={{ backgroundColor: colorFor(t.url || 'start') }} />
                      <div className="mt-2 h-2 w-3/4 rounded bg-black/10" />
                      <div className="mt-1.5 h-2 w-1/2 rounded bg-black/10" />
                    </button>
                    {safari.tabs.length > 1 && (
                      <button
                        aria-label={`Close ${t.title}`}
                        onClick={() =>
                          update('safari', (s) => {
                            const tabs = s.tabs.filter((x) => x.id !== t.id)
                            return { ...s, tabs, activeTabId: s.activeTabId === t.id ? tabs[0].id : s.activeTabId }
                          })
                        }
                        className="absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full bg-black/40 text-white"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                  <span className="truncate text-center text-[12px] font-medium">{t.title}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between px-5 pt-3 pb-8 text-[17px] text-[#007AFF]">
              <button onClick={newTab} aria-label="New tab">
                <Plus className="size-7" />
              </button>
              <span className="text-[15px] font-semibold text-black">{safari.tabs.length} Tabs</span>
              <button onClick={() => setShowTabs(false)} className="font-semibold">
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function StartPage({ onNavigate }: { onNavigate: (u: string) => void }) {
  const { state, update } = useOS()
  return (
    <div className="px-5 pt-4">
      <h2 className="text-[22px] font-bold">Favorites</h2>
      <div className="mt-4 grid grid-cols-4 gap-x-3 gap-y-5">
        {state.safari.bookmarks.map((b) => (
          <div key={b.id} className="group relative flex flex-col items-center gap-1.5">
            <button
              onClick={() => onNavigate(b.url)}
              className="grid size-[62px] place-items-center rounded-[14px] text-[24px] font-bold text-white shadow-sm active:scale-95"
              style={{ backgroundColor: colorFor(b.url) }}
            >
              {b.title.charAt(0)}
            </button>
            <span className="w-full truncate text-center text-[11px]">{b.title}</span>
            <button
              aria-label={`Remove ${b.title}`}
              onClick={() => update('safari', (s) => ({ ...s, bookmarks: s.bookmarks.filter((x) => x.id !== b.id) }))}
              className="absolute -top-1.5 right-0 hidden size-5 place-items-center rounded-full bg-black/50 text-white group-hover:grid"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
      </div>
      <h2 className="mt-8 text-[22px] font-bold">Privacy Report</h2>
      <div className="mt-3 rounded-2xl bg-[#F2F2F7] p-4 text-[14px] text-black/70">
        In the last seven days, Safari has prevented 37 trackers from profiling you.
      </div>
    </div>
  )
}

function MockPage({ url, onNavigate }: { url: string; onNavigate: (u: string) => void }) {
  const color = colorFor(url)
  if (url.startsWith('search?q=')) {
    const q = decodeURIComponent(url.slice(9))
    const results = [
      { title: `${q} - Wikipedia`, url: `wikipedia.org/wiki/${q.replace(/\s+/g, '_')}` },
      { title: `${q}: News and updates`, url: `news.example.com/${q.replace(/\s+/g, '-')}` },
      { title: `Best ${q} guide (2026)`, url: `guide.example.com/${q.replace(/\s+/g, '-')}` },
      { title: `${q} on YouTube`, url: `youtube.com/results?q=${q.replace(/\s+/g, '+')}` },
    ]
    return (
      <div className="px-4 pt-3">
        <p className="mb-3 text-[13px] text-black/50">About 1,240,000 results for “{q}”</p>
        <ul className="flex flex-col gap-5">
          {results.map((r) => (
            <li key={r.url}>
              <p className="truncate text-[12px] text-black/50">{r.url}</p>
              <button onClick={() => onNavigate(r.url)} className="text-left text-[18px] text-[#1A0DAB] hover:underline">
                {r.title}
              </button>
              <p className="text-[14px] text-black/60">
                Learn everything about {q}. Explore articles, photos and the latest information curated for you.
              </p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const name = titleFor(url)
  return (
    <article>
      <header className="flex items-center justify-between px-4 py-3" style={{ backgroundColor: color }}>
        <span className="text-[18px] font-bold text-white">{name}</span>
        <span className="flex gap-3 text-[13px] text-white/90">
          <span>Home</span>
          <span>About</span>
          <span>Contact</span>
        </span>
      </header>
      <div className="h-44 bg-cover bg-center" style={{ backgroundImage: 'url(/images/post-3.png)' }} />
      <div className="px-4 py-5">
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color }}>
          {url}
        </p>
        <h1 className="mt-1 text-[26px] leading-tight font-bold">Welcome to {name}</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-black/70">
          This is a simulated page for {url}. Browse links below to keep exploring — every link opens another simulated page in this tab.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {['Latest', 'Popular', 'Explore', 'Help'].map((s) => (
            <button
              key={s}
              onClick={() => onNavigate(`${url.split('/')[0]}/${s.toLowerCase()}`)}
              className="rounded-xl bg-[#F2F2F7] p-3 text-left active:bg-black/10"
            >
              <span className="block text-[15px] font-semibold">{s}</span>
              <span className="text-[12px] text-black/50">Read more</span>
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
