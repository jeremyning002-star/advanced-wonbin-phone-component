'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Camera,
  ChevronLeft,
  File as FileIcon,
  Home,
  Image as ImageIcon,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  Smile,
  UserPlus,
  Users,
  Video,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatClock, uid, useOS } from '@/lib/phone/store'
import type { LineMessage, OpenChat } from '@/lib/phone/types'
import { Avatar, Field, FormGroup, MediaField, readFileAsDataURL, Sheet, TabBar } from '../ui'

const GREEN = '#06C755'
type Tab = 'home' | 'chats' | 'openchat'
type View = { kind: 'list' } | { kind: 'chat'; id: string } | { kind: 'open'; id: string }

export function LineApp() {
  const { state, update } = useOS()
  const [tab, setTab] = useState<Tab>('chats')
  const [view, setView] = useState<View>({ kind: 'list' })
  const line = state.line

  const openChatWith = (contactId: string) => {
    let chat = line.chats.find((c) => c.contactId === contactId)
    if (!chat) {
      chat = { id: uid(), contactId, wallpaper: '#8CABD9', unread: 0, messages: [] }
      const created = chat
      update('line', (l) => ({ ...l, chats: [created, ...l.chats] }))
    }
    setView({ kind: 'chat', id: chat.id })
  }

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <AnimatePresence initial={false} mode="popLayout">
        {view.kind === 'list' ? (
          <motion.div
            key="list"
            className="flex h-full flex-col"
            initial={{ x: '-30%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-30%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="flex-1 overflow-y-auto pt-[54px]">
              {tab === 'home' && <HomeTab onOpenChat={openChatWith} />}
              {tab === 'chats' && <ChatsTab onOpen={(id) => setView({ kind: 'chat', id })} />}
              {tab === 'openchat' && <OpenChatTab onOpen={(id) => setView({ kind: 'open', id })} />}
            </div>
            <TabBar
              tint="#111"
              active={tab}
              onChange={setTab}
              tabs={[
                { id: 'home', label: 'Home', icon: <Home className="size-6" /> },
                { id: 'chats', label: 'Chats', icon: <MessageCircle className="size-6" /> },
                { id: 'openchat', label: 'OpenChat', icon: <Users className="size-6" /> },
              ]}
            />
          </motion.div>
        ) : (
          <motion.div
            key={view.id}
            className="absolute inset-0 z-10"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {view.kind === 'chat' ? (
              <DirectChat id={view.id} onBack={() => setView({ kind: 'list' })} />
            ) : (
              <OpenChatRoom id={view.id} onBack={() => setView({ kind: 'list' })} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SearchBar() {
  return (
    <div className="mx-4 mb-2 flex items-center gap-2 rounded-lg bg-[#F1F2F4] px-3 py-2 text-[15px] text-black/40">
      <Search className="size-4" />
      Search
    </div>
  )
}

function HomeTab({ onOpenChat }: { onOpenChat: (id: string) => void }) {
  const { state, update } = useOS()
  const line = state.line
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: '', avatar: '', status: '' })

  const startEdit = (id: string | null) => {
    if (id === 'new') setDraft({ name: '', avatar: '', status: '' })
    else if (id) {
      const c = line.contacts.find((x) => x.id === id)!
      setDraft({ name: c.name, avatar: c.avatar, status: c.status })
    }
    setEditingId(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 pb-3">
        <h1 className="text-[22px] font-bold">Home</h1>
        <div className="flex gap-4">
          <button onClick={() => startEdit('new')} aria-label="Add friend">
            <UserPlus className="size-6" />
          </button>
          <Settings2 className="size-6" aria-hidden />
        </div>
      </div>
      <SearchBar />
      <button onClick={() => setEditingProfile(true)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-black/5">
        <Avatar src={line.myAvatar} name={line.myName} size={56} />
        <div>
          <p className="text-[17px] font-semibold">{line.myName}</p>
          <p className="text-[13px] text-black/50">{line.myStatus}</p>
        </div>
      </button>
      <p className="mt-2 px-4 pb-1 text-[13px] text-black/50">Friends {line.contacts.length}</p>
      {line.contacts.map((c) => (
        <div key={c.id} className="flex items-center gap-3 px-4 py-2 active:bg-black/5">
          <button onClick={() => onOpenChat(c.id)} className="flex flex-1 items-center gap-3 text-left">
            <Avatar src={c.avatar} name={c.name} size={44} />
            <div className="min-w-0">
              <p className="truncate text-[16px] font-medium">{c.name}</p>
              <p className="truncate text-[13px] text-black/50">{c.status}</p>
            </div>
          </button>
          <button onClick={() => startEdit(c.id)} className="text-[13px] font-medium" style={{ color: GREEN }}>
            Edit
          </button>
        </div>
      ))}

      <Sheet
        open={editingProfile}
        onClose={() => setEditingProfile(false)}
        title="My Profile"
        onSave={() => {}}
      >
        <FormGroup>
          <Field label="Name" value={line.myName} onChange={(v) => update('line', (l) => ({ ...l, myName: v }))} />
          <Field label="Status" value={line.myStatus} onChange={(v) => update('line', (l) => ({ ...l, myStatus: v }))} />
          <MediaField label="Avatar" value={line.myAvatar} onChange={(v) => update('line', (l) => ({ ...l, myAvatar: v }))} />
        </FormGroup>
      </Sheet>

      <Sheet
        open={!!editingId}
        onClose={() => setEditingId(null)}
        title={editingId === 'new' ? 'Add Friend' : 'Edit Friend'}
        saveLabel="Save"
        onSave={() => {
          if (!draft.name.trim()) return
          update('line', (l) =>
            editingId === 'new'
              ? { ...l, contacts: [...l.contacts, { id: uid(), ...draft }] }
              : { ...l, contacts: l.contacts.map((c) => (c.id === editingId ? { ...c, ...draft } : c)) },
          )
        }}
        danger={
          editingId && editingId !== 'new'
            ? {
                label: 'Remove Friend',
                onClick: () =>
                  update('line', (l) => ({
                    ...l,
                    contacts: l.contacts.filter((c) => c.id !== editingId),
                    chats: l.chats.filter((ch) => ch.contactId !== editingId),
                  })),
              }
            : undefined
        }
      >
        <FormGroup>
          <Field label="Name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
          <Field label="Status" value={draft.status} onChange={(v) => setDraft((d) => ({ ...d, status: v }))} />
          <MediaField label="Avatar" value={draft.avatar} onChange={(v) => setDraft((d) => ({ ...d, avatar: v }))} />
        </FormGroup>
      </Sheet>
    </div>
  )
}

function previewText(m?: LineMessage) {
  if (!m) return 'Start chatting'
  if (m.type === 'photo') return 'Sent a photo.'
  if (m.type === 'file') return `File: ${m.text}`
  if (m.type === 'location') return `Location: ${m.text}`
  if (m.type === 'call') return m.text
  return m.text
}

function ChatsTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { state } = useOS()
  const line = state.line
  return (
    <div>
      <div className="flex items-center justify-between px-4 pb-3">
        <h1 className="text-[22px] font-bold">Chats</h1>
        <Menu className="size-6" aria-hidden />
      </div>
      <SearchBar />
      {line.chats.map((ch) => {
        const c = line.contacts.find((x) => x.id === ch.contactId)
        if (!c) return null
        const last = ch.messages[ch.messages.length - 1]
        return (
          <button key={ch.id} onClick={() => onOpen(ch.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left active:bg-black/5">
            <Avatar src={c.avatar} name={c.name} size={50} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold">{c.name}</p>
              <p className="truncate text-[13px] text-black/50">{previewText(last)}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[11px] text-black/40">{last?.time}</span>
              {ch.unread > 0 && (
                <span className="grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[11px] font-semibold text-white" style={{ backgroundColor: GREEN }}>
                  {ch.unread}
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function OpenChatTab({ onOpen }: { onOpen: (id: string) => void }) {
  const { state, update } = useOS()
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState<Omit<OpenChat, 'id' | 'messages' | 'joined'>>({
    name: '',
    description: '',
    cover: '',
    members: 1,
    category: 'General',
  })

  const start = (id: string) => {
    if (id === 'new') setDraft({ name: '', description: '', cover: '/images/post-3.png', members: 1, category: 'General' })
    else {
      const o = state.line.openChats.find((x) => x.id === id)!
      setDraft({ name: o.name, description: o.description, cover: o.cover, members: o.members, category: o.category })
    }
    setEditing(id)
  }

  return (
    <div>
      <div className="flex items-center justify-between px-4 pb-3">
        <h1 className="text-[22px] font-bold">OpenChat</h1>
        <button onClick={() => start('new')} className="flex items-center gap-1 rounded-full px-3 py-1 text-[13px] font-semibold text-white" style={{ backgroundColor: GREEN }}>
          <Plus className="size-4" /> Create
        </button>
      </div>
      <SearchBar />
      <div className="flex flex-col gap-3 px-4 pb-4">
        {state.line.openChats.map((o) => (
          <div key={o.id} className="overflow-hidden rounded-2xl border border-black/10">
            <button onClick={() => onOpen(o.id)} className="block w-full text-left">
              <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${o.cover})` }} />
              <div className="p-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-black/5 px-1.5 py-0.5 text-[11px] text-black/60">{o.category}</span>
                  <span className="text-[12px] text-black/50">{o.members.toLocaleString()} members</span>
                </div>
                <p className="mt-1 text-[16px] font-semibold">{o.name}</p>
                <p className="line-clamp-2 text-[13px] text-black/60">{o.description}</p>
              </div>
            </button>
            <div className="flex border-t border-black/10 text-[14px] font-medium">
              <button
                className="flex-1 py-2"
                style={{ color: GREEN }}
                onClick={() =>
                  update('line', (l) => ({
                    ...l,
                    openChats: l.openChats.map((x) =>
                      x.id === o.id ? { ...x, joined: !x.joined, members: x.members + (x.joined ? -1 : 1) } : x,
                    ),
                  }))
                }
              >
                {o.joined ? 'Leave' : 'Join'}
              </button>
              <button className="flex-1 border-l border-black/10 py-2 text-black/60" onClick={() => start(o.id)}>
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'New OpenChat' : 'Edit OpenChat'}
        saveLabel="Save"
        onSave={() => {
          if (!draft.name.trim()) return
          update('line', (l) =>
            editing === 'new'
              ? { ...l, openChats: [{ id: uid(), ...draft, joined: true, messages: [] }, ...l.openChats] }
              : { ...l, openChats: l.openChats.map((o) => (o.id === editing ? { ...o, ...draft } : o)) },
          )
        }}
        danger={
          editing && editing !== 'new'
            ? { label: 'Delete OpenChat', onClick: () => update('line', (l) => ({ ...l, openChats: l.openChats.filter((o) => o.id !== editing) })) }
            : undefined
        }
      >
        <FormGroup>
          <Field label="Name" value={draft.name} onChange={(v) => setDraft((d) => ({ ...d, name: v }))} />
          <Field label="Category" value={draft.category} onChange={(v) => setDraft((d) => ({ ...d, category: v }))} />
          <Field label="Members" type="number" value={draft.members} onChange={(v) => setDraft((d) => ({ ...d, members: Number(v) || 0 }))} />
          <MediaField label="Cover" value={draft.cover} onChange={(v) => setDraft((d) => ({ ...d, cover: v }))} />
          <Field label="About" multiline value={draft.description} onChange={(v) => setDraft((d) => ({ ...d, description: v }))} />
        </FormGroup>
      </Sheet>
    </div>
  )
}

function DirectChat({ id, onBack }: { id: string; onBack: () => void }) {
  const { state, update, startCall } = useOS()
  const chat = state.line.chats.find((c) => c.id === id)
  const contact = state.line.contacts.find((c) => c.id === chat?.contactId)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    update('line', (l) => ({ ...l, chats: l.chats.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) }))
  }, [id, update])

  if (!chat || !contact) return null

  const setMessages = (fn: (m: LineMessage[]) => LineMessage[]) =>
    update('line', (l) => ({ ...l, chats: l.chats.map((c) => (c.id === id ? { ...c, messages: fn(c.messages) } : c)) }))

  const call = (video: boolean) => {
    setMessages((m) => [
      ...m,
      { id: uid(), from: 'me', type: 'call', text: video ? 'Video call' : 'Voice call', time: formatClock(new Date(), true) },
    ])
    startCall({ name: contact.name, number: 'LINE', avatar: contact.avatar, app: 'line', video })
  }

  return (
    <>
      <ChatRoom
        title={contact.name}
        wallpaper={chat.wallpaper}
        messages={chat.messages}
        onBack={onBack}
        setMessages={setMessages}
        avatar={contact.avatar}
        actions={
          <>
            <button onClick={() => call(false)} aria-label="Voice call">
              <Phone className="size-5" />
            </button>
            <button onClick={() => call(true)} aria-label="Video call">
              <Video className="size-5" />
            </button>
            <button onClick={() => setSettingsOpen(true)} aria-label="Chat settings">
              <Menu className="size-5" />
            </button>
          </>
        }
      />
      <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Chat Settings">
        <FormGroup label="Contact">
          <Field
            label="Name"
            value={contact.name}
            onChange={(v) => update('line', (l) => ({ ...l, contacts: l.contacts.map((c) => (c.id === contact.id ? { ...c, name: v } : c)) }))}
          />
          <MediaField
            label="Avatar"
            value={contact.avatar}
            onChange={(v) => update('line', (l) => ({ ...l, contacts: l.contacts.map((c) => (c.id === contact.id ? { ...c, avatar: v } : c)) }))}
          />
        </FormGroup>
        <FormGroup label="Chat">
          <MediaField
            label="Wallpaper"
            value={chat.wallpaper}
            onChange={(v) => update('line', (l) => ({ ...l, chats: l.chats.map((c) => (c.id === id ? { ...c, wallpaper: v } : c)) }))}
          />
          <div className="flex gap-2 px-4 py-2.5">
            {['#8CABD9', '#F2D7C9', '#D6E4D2', '#E6DDF5', '#2B2F3A'].map((c) => (
              <button
                key={c}
                aria-label={`Wallpaper ${c}`}
                onClick={() => update('line', (l) => ({ ...l, chats: l.chats.map((x) => (x.id === id ? { ...x, wallpaper: c } : x)) }))}
                className="size-8 rounded-full border border-black/10"
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <Field
            label="Unread badge"
            type="number"
            value={chat.unread}
            onChange={(v) => update('line', (l) => ({ ...l, chats: l.chats.map((c) => (c.id === id ? { ...c, unread: Math.max(0, Number(v) || 0) } : c)) }))}
          />
        </FormGroup>
        <FormGroup label="Simulate">
          <button
            className="px-4 py-3 text-left text-[16px] text-[#007AFF]"
            onClick={() =>
              update('line', (l) => ({
                ...l,
                chats: l.chats.map((c) =>
                  c.id === id
                    ? { ...c, messages: [...c.messages, { id: uid(), from: 'them', type: 'text', text: 'Hey! 👋', time: formatClock(new Date(), true) }] }
                    : c,
                ),
              }))
            }
          >
            Receive a message from {contact.name}
          </button>
          <button className="px-4 py-3 text-left text-[16px] text-[#FF3B30]" onClick={() => setMessages(() => [])}>
            Clear chat history
          </button>
        </FormGroup>
      </Sheet>
    </>
  )
}

function OpenChatRoom({ id, onBack }: { id: string; onBack: () => void }) {
  const { state, update } = useOS()
  const oc = state.line.openChats.find((o) => o.id === id)
  if (!oc) return null
  return (
    <ChatRoom
      title={`${oc.name} (${oc.members})`}
      wallpaper="#C9D7E8"
      messages={oc.messages}
      onBack={onBack}
      avatar={oc.cover}
      setMessages={(fn) => update('line', (l) => ({ ...l, openChats: l.openChats.map((o) => (o.id === id ? { ...o, messages: fn(o.messages) } : o)) }))}
    />
  )
}

function ChatRoom({
  title,
  wallpaper,
  messages,
  onBack,
  setMessages,
  actions,
  avatar,
}: {
  title: string
  wallpaper: string
  messages: LineMessage[]
  onBack: () => void
  setMessages: (fn: (m: LineMessage[]) => LineMessage[]) => void
  actions?: React.ReactNode
  avatar?: string
}) {
  const [text, setText] = useState('')
  const [attachOpen, setAttachOpen] = useState(false)
  const [selected, setSelected] = useState<LineMessage | null>(null)
  const [editText, setEditText] = useState('')
  const [extra, setExtra] = useState<{ kind: 'file' | 'location' | 'photo'; value: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const isColor = wallpaper.startsWith('#')

  const send = (msg: Omit<LineMessage, 'id' | 'time' | 'from'>) => {
    setMessages((m) => [...m, { id: uid(), from: 'me', time: formatClock(new Date(), true), ...msg }])
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }))
  }

  return (
    <div className="relative flex h-full flex-col">
      <div className="absolute inset-0" style={isColor ? { backgroundColor: wallpaper } : { backgroundImage: `url(${wallpaper})`, backgroundSize: 'cover' }} />
      <header className="relative z-10 flex items-center gap-2 bg-white/80 px-2 pt-[54px] pb-2 backdrop-blur-xl">
        <button onClick={onBack} aria-label="Back" className="active:opacity-50">
          <ChevronLeft className="size-7" />
        </button>
        <span className="min-w-0 flex-1 truncate text-[17px] font-semibold">{title}</span>
        <div className="flex items-center gap-4 pr-2">{actions}</div>
      </header>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-3 py-3">
        <div className="flex flex-col gap-2.5">
          {messages.length === 0 && <p className="mx-auto mt-10 rounded-full bg-black/20 px-3 py-1 text-[12px] text-white">No messages yet</p>}
          {messages.map((m) => (
            <motion.div
              key={m.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-1.5 ${m.from === 'me' ? 'flex-row-reverse' : ''}`}
            >
              {m.from === 'them' && <Avatar src={avatar} name={title} size={30} className="self-start" />}
              <button
                onClick={() => {
                  setSelected(m)
                  setEditText(m.text)
                }}
                className={`max-w-[72%] text-left text-[15px] leading-snug active:opacity-70 ${
                  m.type === 'photo' ? '' : `rounded-[18px] px-3 py-2 ${m.from === 'me' ? 'bg-[#85E249] text-black' : 'bg-white text-black'}`
                }`}
              >
                {m.type === 'text' && <span className="whitespace-pre-wrap">{m.text}</span>}
                {m.type === 'photo' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.url} alt="Shared photo" className="max-h-56 rounded-2xl object-cover" />
                )}
                {m.type === 'file' && (
                  <span className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-[#FF3B30] text-white">
                      <FileIcon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-medium">{m.text}</span>
                      <span className="block text-[12px] text-black/50">2.4 MB</span>
                    </span>
                  </span>
                )}
                {m.type === 'location' && (
                  <span className="block w-48">
                    <span className="relative mb-2 block h-24 overflow-hidden rounded-lg bg-[#E4EEDC]">
                      <span className="absolute inset-0 bg-[linear-gradient(90deg,transparent_48%,#fff_48%,#fff_52%,transparent_52%),linear-gradient(0deg,transparent_45%,#fff_45%,#fff_50%,transparent_50%)] bg-[length:60px_60px]" />
                      <MapPin className="absolute top-1/2 left-1/2 size-7 -translate-x-1/2 -translate-y-full fill-[#FF3B30] text-white" />
                    </span>
                    <span className="block font-medium">{m.text}</span>
                  </span>
                )}
                {m.type === 'call' && (
                  <span className="flex items-center gap-2">
                    {m.text.includes('Video') ? <Video className="size-4" /> : <Phone className="size-4" />}
                    {m.text}
                  </span>
                )}
              </button>
              <span className="mb-0.5 flex flex-col text-[10px] text-black/50">
                {m.from === 'me' && m.read && <span>Read</span>}
                {m.time}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {attachOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="relative z-10 overflow-hidden bg-white"
          >
            <div className="grid grid-cols-4 gap-2 px-4 py-4">
              {[
                { label: 'Photo', icon: ImageIcon, color: '#34C759', onClick: () => fileRef.current?.click() },
                { label: 'Photo URL', icon: Camera, color: '#007AFF', onClick: () => setExtra({ kind: 'photo', value: '' }) },
                { label: 'File', icon: FileIcon, color: '#FF9500', onClick: () => setExtra({ kind: 'file', value: 'Document.pdf' }) },
                { label: 'Location', icon: MapPin, color: '#FF3B30', onClick: () => setExtra({ kind: 'location', value: 'Siam Paragon, Bangkok' }) },
              ].map((a) => (
                <button key={a.label} onClick={a.onClick} className="flex flex-col items-center gap-1 text-[12px]">
                  <span className="grid size-12 place-items-center rounded-full text-white" style={{ backgroundColor: a.color }}>
                    <a.icon className="size-5" />
                  </span>
                  {a.label}
                </button>
              ))}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f) {
                  send({ type: 'photo', text: '', url: await readFileAsDataURL(f) })
                  setAttachOpen(false)
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form
        className="relative z-10 flex items-center gap-2 bg-white px-3 pt-2 pb-8"
        onSubmit={(e) => {
          e.preventDefault()
          if (!text.trim()) return
          send({ type: 'text', text: text.trim() })
          setText('')
        }}
      >
        <button type="button" onClick={() => setAttachOpen((o) => !o)} aria-label="Attachments" aria-expanded={attachOpen}>
          <Plus className={`size-6 transition-transform ${attachOpen ? 'rotate-45' : ''}`} />
        </button>
        <button type="button" onClick={() => fileRef.current?.click()} aria-label="Camera">
          <Camera className="size-6" />
        </button>
        <div className="flex flex-1 items-center rounded-full bg-[#F1F2F4] px-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Aa"
            aria-label="Message"
            className="h-9 flex-1 bg-transparent text-[15px] outline-none"
          />
          <Smile className="size-5 text-black/40" aria-hidden />
        </div>
        <button type="submit" aria-label="Send" disabled={!text.trim()} className="disabled:opacity-30" style={{ color: GREEN }}>
          <Send className="size-6" />
        </button>
      </form>

      <Sheet
        open={!!extra}
        onClose={() => setExtra(null)}
        title={extra?.kind === 'file' ? 'Send File' : extra?.kind === 'location' ? 'Share Location' : 'Send Photo'}
        saveLabel="Send"
        onSave={() => {
          if (!extra?.value.trim()) return
          if (extra.kind === 'photo') send({ type: 'photo', text: '', url: extra.value })
          else send({ type: extra.kind, text: extra.value })
          setAttachOpen(false)
        }}
      >
        <FormGroup>
          {extra?.kind === 'photo' ? (
            <MediaField label="Photo" value={extra.value} onChange={(v) => setExtra((x) => x && { ...x, value: v })} />
          ) : (
            <Field
              label={extra?.kind === 'file' ? 'File name' : 'Place'}
              value={extra?.value ?? ''}
              onChange={(v) => setExtra((x) => x && { ...x, value: v })}
            />
          )}
        </FormGroup>
      </Sheet>

      <Sheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title="Edit Message"
        saveLabel="Save"
        onSave={() => selected && setMessages((ms) => ms.map((m) => (m.id === selected.id ? { ...m, text: editText } : m)))}
        danger={{ label: 'Unsend Message', onClick: () => selected && setMessages((ms) => ms.filter((m) => m.id !== selected.id)) }}
      >
        <FormGroup>
          <Field label="Text" multiline value={editText} onChange={setEditText} />
          {selected && (
            <button
              className="px-4 py-3 text-left text-[16px] text-[#007AFF]"
              onClick={() => {
                setMessages((ms) => ms.map((m) => (m.id === selected.id ? { ...m, from: m.from === 'me' ? 'them' : 'me' } : m)))
                setSelected(null)
              }}
            >
              Switch sender (me / them)
            </button>
          )}
        </FormGroup>
      </Sheet>
    </div>
  )
}
