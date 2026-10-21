'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  Bookmark,
  Clapperboard,
  Grid3x3,
  Heart,
  Home,
  MessageCircle,
  MoreHorizontal,
  Plus,
  PlusSquare,
  Search,
  Send,
  Trash2,
  UserRound,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { uid, useOS } from '@/lib/phone/store'
import type { IgMedia } from '@/lib/phone/types'
import { Avatar, Field, FormGroup, MediaField, SelectField, Sheet } from '../ui'

type Tab = 'feed' | 'search' | 'reels' | 'profile'
type Composer = { target: 'post' | 'reel' | 'story'; type: 'photo' | 'video'; url: string; caption: string } | null

const RING = 'bg-[conic-gradient(from_210deg,#FEDA75,#FA7E1E,#D62976,#962FBF,#4F5BD5,#FEDA75)]'

const compact = (n: number) => (n >= 10000 ? `${(n / 1000).toFixed(1).replace('.0', '')}K` : n.toLocaleString())

export function InstagramApp() {
  const { update } = useOS()
  const [tab, setTab] = useState<Tab>('feed')
  const [storyIndex, setStoryIndex] = useState<number | null>(null)
  const [composer, setComposer] = useState<Composer>(null)

  useEffect(() => {
    update('instagram', (ig) => ({ ...ig, badge: 0 }))
  }, [update])

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <div className="relative flex-1 overflow-hidden">
        {tab === 'feed' && <Feed onStory={setStoryIndex} onCompose={setComposer} />}
        {tab === 'search' && <Explore />}
        {tab === 'reels' && <Reels onCompose={setComposer} />}
        {tab === 'profile' && <Profile onCompose={setComposer} />}
      </div>

      <nav className={`flex shrink-0 justify-around border-t pt-2.5 pb-8 ${tab === 'reels' ? 'border-white/10 bg-black text-white' : 'border-black/10 bg-white'}`}>
        {(
          [
            ['feed', Home],
            ['search', Search],
            ['compose', PlusSquare],
            ['reels', Clapperboard],
            ['profile', UserRound],
          ] as const
        ).map(([id, Icon]) => (
          <button
            key={id}
            aria-label={id}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => (id === 'compose' ? setComposer({ target: 'post', type: 'photo', url: '', caption: '' }) : setTab(id))}
            className="active:scale-90 transition-transform"
          >
            <Icon className="size-[26px]" strokeWidth={tab === id ? 2.6 : 1.8} />
          </button>
        ))}
      </nav>

      <AnimatePresence>{storyIndex !== null && <StoryViewer index={storyIndex} onChange={setStoryIndex} />}</AnimatePresence>
      <ComposerSheet composer={composer} setComposer={setComposer} />
    </div>
  )
}

function Feed({ onStory, onCompose }: { onStory: (i: number) => void; onCompose: (c: Composer) => void }) {
  const { state, update } = useOS()
  const ig = state.instagram

  const toggleLike = (id: string) =>
    update('instagram', (s) => ({
      ...s,
      posts: s.posts.map((p) => (p.id === id ? { ...p, liked: !p.liked, likes: p.likes + (p.liked ? -1 : 1) } : p)),
    }))

  return (
    <div className="h-full overflow-y-auto pt-[50px]">
      <header className="flex items-center justify-between px-4 py-2">
        <span className="font-serif text-[28px] font-semibold italic tracking-tight">Instagram</span>
        <div className="flex gap-5">
          <Heart className="size-6" aria-hidden />
          <MessageCircle className="size-6" aria-hidden />
        </div>
      </header>

      <div className="flex gap-3.5 overflow-x-auto px-3 py-2">
        <button
          onClick={() => onCompose({ target: 'story', type: 'photo', url: '', caption: '' })}
          className="flex w-[70px] shrink-0 flex-col items-center gap-1"
        >
          <span className="relative">
            <Avatar src={ig.profile.avatar} name={ig.profile.name} size={66} />
            <span className="absolute right-0 bottom-0 grid size-5 place-items-center rounded-full border-2 border-white bg-[#0095F6] text-white">
              <Plus className="size-3" strokeWidth={3} />
            </span>
          </span>
          <span className="text-[11px]">Your story</span>
        </button>
        {ig.stories.map((s, i) => (
          <button key={s.id} onClick={() => onStory(i)} className="flex w-[70px] shrink-0 flex-col items-center gap-1">
            <span className={`rounded-full p-[2.5px] ${s.seen ? 'bg-black/15' : RING}`}>
              <span className="block rounded-full bg-white p-[2px]">
                <Avatar src={s.avatar} name={s.user} size={60} />
              </span>
            </span>
            <span className="w-full truncate text-center text-[11px]">{s.user}</span>
          </button>
        ))}
      </div>

      <div className="border-t border-black/5">
        {ig.posts.map((p) => (
          <article key={p.id} className="pb-3">
            <div className="flex items-center gap-2.5 px-3 py-2.5">
              <span className={`rounded-full p-[2px] ${RING}`}>
                <span className="block rounded-full bg-white p-[1.5px]">
                  <Avatar src={ig.profile.avatar} name={ig.profile.name} size={30} />
                </span>
              </span>
              <span className="flex-1 text-[14px] font-semibold">{ig.profile.username}</span>
              <button
                aria-label="Delete post"
                onClick={() => update('instagram', (s) => ({ ...s, posts: s.posts.filter((x) => x.id !== p.id) }))}
              >
                <MoreHorizontal className="size-5" />
              </button>
            </div>
            <div className="relative" onDoubleClick={() => !p.liked && toggleLike(p.id)}>
              <MediaView media={p} className="aspect-square w-full object-cover" />
            </div>
            <div className="flex items-center gap-4 px-3 pt-2.5">
              <motion.button whileTap={{ scale: 1.3 }} onClick={() => toggleLike(p.id)} aria-label={p.liked ? 'Unlike' : 'Like'}>
                <Heart className={`size-[26px] ${p.liked ? 'fill-[#FF3040] text-[#FF3040]' : ''}`} />
              </motion.button>
              <MessageCircle className="size-[26px] -scale-x-100" aria-hidden />
              <Send className="size-[24px]" aria-hidden />
              <Bookmark className="ml-auto size-[26px]" aria-hidden />
            </div>
            <p className="px-3 pt-1.5 text-[14px] font-semibold">{p.likes.toLocaleString()} likes</p>
            <p className="px-3 text-[14px]">
              <span className="font-semibold">{ig.profile.username}</span> {p.caption}
            </p>
          </article>
        ))}
        {ig.posts.length === 0 && <p className="py-16 text-center text-[14px] text-black/50">No posts yet. Tap + to share one.</p>}
      </div>
    </div>
  )
}

function MediaView({ media, className, autoPlay }: { media: { type: 'photo' | 'video'; url: string }; className?: string; autoPlay?: boolean }) {
  if (media.type === 'video') {
    return <video src={media.url} className={className} muted loop playsInline autoPlay={autoPlay ?? true} />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={media.url} alt="" className={className} />
}

function Explore() {
  const { state } = useOS()
  const all = [...state.instagram.posts, ...state.instagram.reels, ...state.instagram.posts]
  return (
    <div className="h-full overflow-y-auto pt-[54px]">
      <div className="mx-3 mb-2 flex items-center gap-2 rounded-xl bg-[#EFEFEF] px-3 py-2 text-[15px] text-black/40">
        <Search className="size-4" /> Search
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {all.map((m, i) => (
          <MediaView key={`${m.id}-${i}`} media={m} className="aspect-square w-full object-cover" />
        ))}
      </div>
    </div>
  )
}

function Reels({ onCompose }: { onCompose: (c: Composer) => void }) {
  const { state, update } = useOS()
  const [muted, setMuted] = useState(true)
  const reels = state.instagram.reels

  return (
    <div className="relative h-full bg-black text-white">
      <div className="absolute inset-x-0 top-[54px] z-10 flex items-center justify-between px-4">
        <span className="text-[22px] font-bold">Reels</span>
        <button onClick={() => onCompose({ target: 'reel', type: 'video', url: '', caption: '' })} aria-label="New reel">
          <PlusSquare className="size-6" />
        </button>
      </div>
      <div className="h-full snap-y snap-mandatory overflow-y-auto">
        {reels.length === 0 && <p className="pt-60 text-center text-white/60">No reels yet</p>}
        {reels.map((r) => (
          <ReelItem
            key={r.id}
            reel={r}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onLike={() =>
              update('instagram', (s) => ({
                ...s,
                reels: s.reels.map((x) => (x.id === r.id ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) } : x)),
              }))
            }
            onDelete={() => update('instagram', (s) => ({ ...s, reels: s.reels.filter((x) => x.id !== r.id) }))}
          />
        ))}
      </div>
    </div>
  )
}

function ReelItem({
  reel,
  muted,
  onToggleMute,
  onLike,
  onDelete,
}: {
  reel: IgMedia
  muted: boolean
  onToggleMute: () => void
  onLike: () => void
  onDelete: () => void
}) {
  const { state } = useOS()
  const ref = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.play().catch(() => {})
        else el.pause()
      },
      { threshold: 0.6 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div className="relative h-full w-full snap-start">
      {reel.type === 'video' ? (
        <video
          ref={ref}
          src={reel.url}
          loop
          playsInline
          muted={muted}
          className="h-full w-full object-cover"
          onClick={() => {
            const el = ref.current
            if (!el) return
            if (el.paused) {
              el.play()
              setPaused(false)
            } else {
              el.pause()
              setPaused(true)
            }
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={reel.url} alt="" className="h-full w-full object-cover" />
      )}
      {paused && <div className="pointer-events-none absolute inset-0 grid place-items-center text-[60px] text-white/80">▶</div>}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-5">
        <button onClick={onLike} className="flex flex-col items-center text-[12px]" aria-label="Like">
          <Heart className={`size-7 ${reel.liked ? 'fill-[#FF3040] text-[#FF3040]' : ''}`} />
          {compact(reel.likes)}
        </button>
        <span className="flex flex-col items-center text-[12px]">
          <MessageCircle className="size-7 -scale-x-100" />
          128
        </span>
        <button onClick={onToggleMute} aria-label={muted ? 'Unmute' : 'Mute'}>
          {muted ? <VolumeX className="size-6" /> : <Volume2 className="size-6" />}
        </button>
        <button onClick={onDelete} aria-label="Delete reel">
          <Trash2 className="size-6" />
        </button>
      </div>
      <div className="absolute bottom-6 left-4 max-w-[70%]">
        <div className="flex items-center gap-2">
          <Avatar src={state.instagram.profile.avatar} name="me" size={30} />
          <span className="text-[14px] font-semibold">{state.instagram.profile.username}</span>
        </div>
        <p className="mt-2 text-[14px]">{reel.caption}</p>
      </div>
    </div>
  )
}

function Profile({ onCompose }: { onCompose: (c: Composer) => void }) {
  const { state, update } = useOS()
  const p = state.instagram.profile
  const [editing, setEditing] = useState(false)
  const [grid, setGrid] = useState<'posts' | 'reels'>('posts')
  const setP = (patch: Partial<typeof p>) => update('instagram', (s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  const items = grid === 'posts' ? state.instagram.posts : state.instagram.reels

  return (
    <div className="h-full overflow-y-auto pt-[54px]">
      <header className="flex items-center justify-between px-4 py-1">
        <span className="text-[22px] font-bold">{p.username}</span>
        <button onClick={() => onCompose({ target: 'post', type: 'photo', url: '', caption: '' })} aria-label="New post">
          <PlusSquare className="size-6" />
        </button>
      </header>
      <div className="flex items-center gap-6 px-4 pt-3">
        <Avatar src={p.avatar} name={p.name} size={86} />
        <div className="flex flex-1 justify-around text-center">
          {[
            [state.instagram.posts.length, 'posts'],
            [p.followers, 'followers'],
            [p.following, 'following'],
          ].map(([n, l]) => (
            <div key={l as string}>
              <p className="text-[17px] font-semibold">{compact(n as number)}</p>
              <p className="text-[13px]">{l}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 pt-3">
        <p className="text-[14px] font-semibold">{p.name}</p>
        <p className="text-[14px] whitespace-pre-line">{p.bio}</p>
        {p.link && <p className="text-[14px] font-medium text-[#00376B]">{p.link}</p>}
      </div>
      <div className="flex gap-1.5 px-4 pt-3">
        <button onClick={() => setEditing(true)} className="flex-1 rounded-lg bg-[#EFEFEF] py-1.5 text-[14px] font-semibold active:bg-black/15">
          Edit profile
        </button>
        <button className="flex-1 rounded-lg bg-[#EFEFEF] py-1.5 text-[14px] font-semibold">Share profile</button>
      </div>

      <div className="mt-4 flex border-t border-black/10">
        {(['posts', 'reels'] as const).map((g) => (
          <button
            key={g}
            onClick={() => setGrid(g)}
            className={`flex flex-1 justify-center py-2.5 ${grid === g ? 'border-b border-black' : 'text-black/40'}`}
            aria-label={g}
          >
            {g === 'posts' ? <Grid3x3 className="size-6" /> : <Clapperboard className="size-6" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-0.5">
        {items.map((m) => (
          <div key={m.id} className="group relative">
            <MediaView media={m} autoPlay={false} className={`w-full object-cover ${grid === 'reels' ? 'aspect-[9/16]' : 'aspect-square'}`} />
            <button
              onClick={() =>
                update('instagram', (s) =>
                  grid === 'posts' ? { ...s, posts: s.posts.filter((x) => x.id !== m.id) } : { ...s, reels: s.reels.filter((x) => x.id !== m.id) },
                )
              }
              className="absolute top-1 right-1 grid size-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>

      <Sheet open={editing} onClose={() => setEditing(false)} title="Edit profile">
        <FormGroup>
          <MediaField label="Photo" value={p.avatar} onChange={(v) => setP({ avatar: v })} />
          <Field label="Name" value={p.name} onChange={(v) => setP({ name: v })} />
          <Field label="Username" value={p.username} onChange={(v) => setP({ username: v })} />
          <Field label="Link" value={p.link} onChange={(v) => setP({ link: v })} />
          <Field label="Followers" type="number" value={p.followers} onChange={(v) => setP({ followers: Number(v) || 0 })} />
          <Field label="Following" type="number" value={p.following} onChange={(v) => setP({ following: Number(v) || 0 })} />
          <Field label="Bio" multiline value={p.bio} onChange={(v) => setP({ bio: v })} />
        </FormGroup>
      </Sheet>
    </div>
  )
}

function StoryViewer({ index, onChange }: { index: number; onChange: (i: number | null) => void }) {
  const { state, update } = useOS()
  const stories = state.instagram.stories
  const story = stories[index]
  const [progress, setProgress] = useState(0)
  const DURATION = 5000

  useEffect(() => {
    setProgress(0)
    if (!story) return
    update('instagram', (s) => ({ ...s, stories: s.stories.map((x) => (x.id === story.id ? { ...x, seen: true } : x)) }))
    const start = Date.now()
    const id = setInterval(() => {
      const p = (Date.now() - start) / DURATION
      if (p >= 1) {
        clearInterval(id)
        onChange(index + 1 < stories.length ? index + 1 : null)
      } else setProgress(p)
    }, 50)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, story?.id])

  if (!story) return null

  return (
    <motion.div
      className="absolute inset-0 z-50 bg-black text-white"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
    >
      <MediaView media={story} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/50 to-transparent" />
      <div className="absolute inset-x-2 top-[54px] flex gap-1">
        {stories.map((s, i) => (
          <div key={s.id} className="h-[2.5px] flex-1 overflow-hidden rounded-full bg-white/35">
            <div className="h-full bg-white" style={{ width: `${i < index ? 100 : i === index ? progress * 100 : 0}%` }} />
          </div>
        ))}
      </div>
      <div className="absolute inset-x-3 top-[66px] flex items-center gap-2">
        <Avatar src={story.avatar} name={story.user} size={32} />
        <span className="text-[14px] font-semibold">{story.user}</span>
        <span className="text-[13px] text-white/70">2h</span>
        <button
          className="ml-auto"
          aria-label="Delete story"
          onClick={() => {
            update('instagram', (s) => ({ ...s, stories: s.stories.filter((x) => x.id !== story.id) }))
            onChange(index < stories.length - 1 ? index : null)
          }}
        >
          <Trash2 className="size-5" />
        </button>
        <button onClick={() => onChange(null)} aria-label="Close story">
          <X className="size-7" />
        </button>
      </div>
      <button className="absolute top-28 bottom-24 left-0 w-1/3" aria-label="Previous story" onClick={() => onChange(Math.max(0, index - 1))} />
      <button
        className="absolute top-28 right-0 bottom-24 w-2/3"
        aria-label="Next story"
        onClick={() => onChange(index + 1 < stories.length ? index + 1 : null)}
      />
      <div className="absolute inset-x-3 bottom-8 flex items-center gap-3">
        <div className="flex-1 rounded-full border border-white/60 px-4 py-2.5 text-[14px] text-white/80">Send message</div>
        <Heart className="size-7" aria-hidden />
        <Send className="size-6" aria-hidden />
      </div>
    </motion.div>
  )
}

function ComposerSheet({ composer, setComposer }: { composer: Composer; setComposer: (c: Composer) => void }) {
  const { state, update } = useOS()
  const set = (patch: Partial<NonNullable<Composer>>) => composer && setComposer({ ...composer, ...patch })
  const title = composer?.target === 'story' ? 'New Story' : composer?.target === 'reel' ? 'New Reel' : 'New Post'

  return (
    <Sheet
      open={!!composer}
      onClose={() => setComposer(null)}
      title={title}
      saveLabel="Share"
      onSave={() => {
        if (!composer?.url.trim()) return
        const { target, type, url, caption } = composer
        update('instagram', (s) => {
          if (target === 'story') {
            return { ...s, stories: [{ id: uid(), user: s.profile.username, avatar: s.profile.avatar, type, url }, ...s.stories] }
          }
          const item: IgMedia = { id: uid(), type, url, caption, likes: 0 }
          return target === 'reel' ? { ...s, reels: [item, ...s.reels] } : { ...s, posts: [item, ...s.posts] }
        })
      }}
    >
      <FormGroup>
        <SelectField
          label="Share to"
          value={composer?.target ?? 'post'}
          onChange={(v) => set({ target: v })}
          options={[
            { value: 'post', label: 'Feed post' },
            { value: 'reel', label: 'Reel' },
            { value: 'story', label: 'Story' },
          ]}
        />
        <SelectField
          label="Media type"
          value={composer?.type ?? 'photo'}
          onChange={(v) => set({ type: v })}
          options={[
            { value: 'photo', label: 'Photo' },
            { value: 'video', label: 'Video' },
          ]}
        />
        <MediaField
          label={composer?.type === 'video' ? 'Video' : 'Photo'}
          accept={composer?.type === 'video' ? 'video/*' : 'image/*'}
          value={composer?.url ?? ''}
          onChange={(v) => set({ url: v })}
        />
        {composer?.target !== 'story' && <Field label="Caption" multiline value={composer?.caption ?? ''} onChange={(v) => set({ caption: v })} />}
      </FormGroup>
      {composer?.url && (
        <div className="overflow-hidden rounded-xl bg-black">
          <MediaView media={{ type: composer.type, url: composer.url }} className="max-h-60 w-full object-contain" />
        </div>
      )}
      <p className="px-2 text-[12px] text-black/50">
        Paste an image or video URL, or upload a file. Posting as @{state.instagram.profile.username}.
      </p>
    </Sheet>
  )
}
