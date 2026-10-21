'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FastForward, ListMusic, Pause, Play, Plus, Rewind, Trash2, Video } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fmtTime, getAudio, useAudioProgress } from '@/lib/phone/audio'
import { uid, useOS } from '@/lib/phone/store'
import type { Track } from '@/lib/phone/types'
import { Field, FormGroup, MediaField, NavHeader, SelectField, Sheet } from '../ui'

const PINK = '#FA2D48'

export function MusicEngine() {
  const { state, update } = useOS()
  const { tracks, currentId, playing } = state.music
  const track = tracks.find((t) => t.id === currentId)

  useEffect(() => {
    const el = getAudio()
    if (!el) return
    if (!track || track.type === 'video') {
      el.pause()
      return
    }
    if (el.dataset.src !== track.url) {
      el.src = track.url
      el.dataset.src = track.url
    }
    if (playing) el.play().catch(() => update('music', (m) => ({ ...m, playing: false })))
    else el.pause()
  }, [track, playing, update])

  useEffect(() => {
    const el = getAudio()
    if (!el) return
    const onEnded = () =>
      update('music', (m) => {
        const i = m.tracks.findIndex((t) => t.id === m.currentId)
        const next = m.tracks[(i + 1) % m.tracks.length]
        return { ...m, currentId: next?.id ?? null }
      })
    el.addEventListener('ended', onEnded)
    return () => el.removeEventListener('ended', onEnded)
  }, [update])

  return null
}

export function MusicApp() {
  const { state, update } = useOS()
  const music = state.music
  const current = music.tracks.find((t) => t.id === music.currentId)
  const [playlistId, setPlaylistId] = useState<string | null>(null)
  const [nowPlaying, setNowPlaying] = useState(false)
  const [editing, setEditing] = useState<(Omit<Track, 'id'> & { id: string }) | null>(null)
  const [newPlaylist, setNewPlaylist] = useState<string | null>(null)

  const playlist = music.playlists.find((p) => p.id === playlistId)
  const list = playlist ? music.tracks.filter((t) => playlist.trackIds.includes(t.id)) : music.tracks

  const play = (id: string) => update('music', (m) => ({ ...m, currentId: id, playing: true }))

  return (
    <div className="relative flex h-full flex-col bg-white text-black">
      <div className="flex-1 overflow-y-auto pt-[54px] pb-4">
        <NavHeader
          large
          title={playlist ? playlist.name : 'Library'}
          onBack={playlist ? () => setPlaylistId(null) : undefined}
          backLabel="Library"
          tint="text-[#FA2D48]"
          right={
            <button
              aria-label="Add track"
              onClick={() => setEditing({ id: 'new', title: '', artist: '', url: '', cover: '/images/post-2.png', type: 'audio' })}
            >
              <Plus className="size-6" />
            </button>
          }
        />

        {!playlist && (
          <>
            <div className="flex items-center justify-between px-4 pt-2 pb-2">
              <h2 className="text-[20px] font-bold">Playlists</h2>
              <button onClick={() => setNewPlaylist('')} className="text-[15px]" style={{ color: PINK }}>
                New
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto px-4 pb-4">
              {music.playlists.map((p) => {
                const cover = music.tracks.find((t) => t.id === p.trackIds[0])?.cover
                return (
                  <button key={p.id} onClick={() => setPlaylistId(p.id)} className="w-36 shrink-0 text-left">
                    <div
                      className="grid aspect-square place-items-center rounded-lg bg-[#F2F2F7] bg-cover bg-center shadow-sm"
                      style={cover ? { backgroundImage: `url(${cover})` } : undefined}
                    >
                      {!cover && <ListMusic className="size-10 text-black/30" />}
                    </div>
                    <p className="mt-1.5 truncate text-[14px]">{p.name}</p>
                    <p className="text-[13px] text-black/50">{p.trackIds.length} songs</p>
                  </button>
                )
              })}
            </div>
            <h2 className="px-4 pb-1 text-[20px] font-bold">Songs</h2>
          </>
        )}

        <ul>
          {list.map((t) => (
            <li key={t.id} className="group flex items-center gap-3 px-4 py-1.5">
              <button onClick={() => play(t.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.cover} alt="" className="size-12 rounded-md object-cover" />
                <div className="min-w-0 flex-1 border-b border-black/10 pb-2">
                  <p className={`flex items-center gap-1 truncate text-[16px] ${t.id === music.currentId ? 'font-semibold' : ''}`} style={t.id === music.currentId ? { color: PINK } : undefined}>
                    {t.type === 'video' && <Video className="size-3.5 shrink-0" />}
                    {t.title}
                  </p>
                  <p className="truncate text-[13px] text-black/50">{t.artist}</p>
                </div>
              </button>
              <button
                onClick={() => setEditing({ ...t })}
                className="text-[13px] font-medium opacity-60 hover:opacity-100"
                style={{ color: PINK }}
              >
                Edit
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="py-10 text-center text-black/40">No songs</li>}
        </ul>
        {playlist && (
          <button
            className="mx-4 mt-4 text-[15px] text-[#FF3B30]"
            onClick={() => {
              update('music', (m) => ({ ...m, playlists: m.playlists.filter((p) => p.id !== playlist.id) }))
              setPlaylistId(null)
            }}
          >
            Delete playlist
          </button>
        )}
      </div>

      {current && (
        <MiniPlayer track={current} playing={music.playing} onOpen={() => setNowPlaying(true)} />
      )}

      <AnimatePresence>{nowPlaying && current && <NowPlaying track={current} onClose={() => setNowPlaying(false)} />}</AnimatePresence>

      <Sheet
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id === 'new' ? 'Add Track' : 'Edit Track'}
        saveLabel="Save"
        onSave={() => {
          if (!editing || !editing.url.trim()) return
          const { id, ...rest } = editing
          update('music', (m) => {
            if (id === 'new') {
              const newId = uid()
              return {
                ...m,
                tracks: [...m.tracks, { id: newId, ...rest }],
                playlists: playlist ? m.playlists.map((p) => (p.id === playlist.id ? { ...p, trackIds: [...p.trackIds, newId] } : p)) : m.playlists,
              }
            }
            return { ...m, tracks: m.tracks.map((t) => (t.id === id ? { id, ...rest } : t)) }
          })
        }}
        danger={
          editing && editing.id !== 'new'
            ? {
                label: 'Delete Track',
                onClick: () =>
                  update('music', (m) => ({
                    ...m,
                    tracks: m.tracks.filter((t) => t.id !== editing.id),
                    playlists: m.playlists.map((p) => ({ ...p, trackIds: p.trackIds.filter((x) => x !== editing.id) })),
                    currentId: m.currentId === editing.id ? null : m.currentId,
                    playing: m.currentId === editing.id ? false : m.playing,
                  })),
              }
            : undefined
        }
      >
        {editing && (
          <>
            <FormGroup>
              <Field label="Title" value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} />
              <Field label="Artist" value={editing.artist} onChange={(v) => setEditing({ ...editing, artist: v })} />
              <SelectField
                label="Type"
                value={editing.type}
                onChange={(v) => setEditing({ ...editing, type: v })}
                options={[
                  { value: 'audio', label: 'Audio' },
                  { value: 'video', label: 'Music video' },
                ]}
              />
              <MediaField
                label="Media"
                accept={editing.type === 'video' ? 'video/*' : 'audio/*'}
                value={editing.url}
                onChange={(v) => setEditing({ ...editing, url: v })}
              />
              <MediaField label="Cover" value={editing.cover} onChange={(v) => setEditing({ ...editing, cover: v })} />
            </FormGroup>
            {editing.id !== 'new' && music.playlists.length > 0 && (
              <FormGroup label="In playlists">
                {music.playlists.map((p) => {
                  const inList = p.trackIds.includes(editing.id)
                  return (
                    <button
                      key={p.id}
                      className="flex w-full justify-between px-4 py-2.5 text-left text-[16px]"
                      onClick={() =>
                        update('music', (m) => ({
                          ...m,
                          playlists: m.playlists.map((x) =>
                            x.id === p.id
                              ? { ...x, trackIds: inList ? x.trackIds.filter((i) => i !== editing.id) : [...x.trackIds, editing.id] }
                              : x,
                          ),
                        }))
                      }
                    >
                      {p.name}
                      <span style={{ color: PINK }}>{inList ? 'Remove' : 'Add'}</span>
                    </button>
                  )
                })}
              </FormGroup>
            )}
          </>
        )}
      </Sheet>

      <Sheet
        open={newPlaylist !== null}
        onClose={() => setNewPlaylist(null)}
        title="New Playlist"
        saveLabel="Create"
        onSave={() =>
          newPlaylist?.trim() && update('music', (m) => ({ ...m, playlists: [...m.playlists, { id: uid(), name: newPlaylist.trim(), trackIds: [] }] }))
        }
      >
        <FormGroup>
          <Field label="Name" value={newPlaylist ?? ''} onChange={setNewPlaylist} />
        </FormGroup>
      </Sheet>
    </div>
  )
}

function MiniPlayer({ track, playing, onOpen }: { track: Track; playing: boolean; onOpen: () => void }) {
  const { update } = useOS()
  return (
    <div className="mx-2 mb-8 flex items-center gap-3 rounded-2xl bg-[#F9F9F9]/95 p-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] backdrop-blur-xl">
      <button onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={track.cover} alt="" className="size-11 rounded-md object-cover" />
        <span className="truncate text-[15px] font-medium">{track.title}</span>
      </button>
      <button onClick={() => update('music', (m) => ({ ...m, playing: !m.playing }))} aria-label={playing ? 'Pause' : 'Play'} className="px-2">
        {playing ? <Pause className="size-6 fill-black" /> : <Play className="size-6 fill-black" />}
      </button>
      <button
        aria-label="Next"
        className="pr-2"
        onClick={() =>
          update('music', (m) => {
            const i = m.tracks.findIndex((t) => t.id === m.currentId)
            return { ...m, currentId: m.tracks[(i + 1) % m.tracks.length]?.id ?? null }
          })
        }
      >
        <FastForward className="size-6 fill-black" />
      </button>
    </div>
  )
}

function NowPlaying({ track, onClose }: { track: Track; onClose: () => void }) {
  const { state, update } = useOS()
  const playing = state.music.playing
  const audioProgress = useAudioProgress()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoProgress, setVideoProgress] = useState({ current: 0, duration: 0 })
  const isVideo = track.type === 'video'
  const { current, duration } = isVideo ? videoProgress : audioProgress

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    if (playing) v.play().catch(() => {})
    else v.pause()
  }, [playing, track.id])

  const skip = (dir: 1 | -1) =>
    update('music', (m) => {
      const i = m.tracks.findIndex((t) => t.id === m.currentId)
      const n = m.tracks.length
      return { ...m, currentId: m.tracks[(i + dir + n) % n]?.id ?? null }
    })

  const seek = (ratio: number) => {
    if (isVideo && videoRef.current) videoRef.current.currentTime = ratio * (videoRef.current.duration || 0)
    else {
      const el = getAudio()
      if (el?.duration) el.currentTime = ratio * el.duration
    }
  }

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden text-white"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 280 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0, bottom: 0.5 }}
      onDragEnd={(_, i) => i.offset.y > 120 && onClose()}
    >
      <div className="absolute inset-0 scale-150 bg-cover bg-center blur-3xl" style={{ backgroundImage: `url(${track.cover})` }} />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative flex flex-1 flex-col px-7 pt-[60px] pb-10">
        <button onClick={onClose} aria-label="Close" className="mx-auto">
          <ChevronDown className="size-8 opacity-70" />
        </button>
        <div className="mt-6 flex flex-1 items-center justify-center">
          {isVideo ? (
            <video
              ref={videoRef}
              src={track.url}
              playsInline
              loop
              className="aspect-video w-full rounded-xl bg-black object-cover shadow-2xl"
              onTimeUpdate={(e) => setVideoProgress({ current: e.currentTarget.currentTime, duration: e.currentTarget.duration || 0 })}
            />
          ) : (
            <motion.img
              src={track.cover}
              alt={`${track.title} cover`}
              animate={{ scale: playing ? 1 : 0.8 }}
              transition={{ type: 'spring', damping: 18 }}
              className="aspect-square w-full rounded-xl object-cover shadow-2xl"
            />
          )}
        </div>
        <div className="mt-8">
          <p className="truncate text-[22px] font-semibold">{track.title}</p>
          <p className="truncate text-[18px] opacity-60">{track.artist}</p>
        </div>
        <input
          type="range"
          min={0}
          max={1000}
          value={duration ? (current / duration) * 1000 : 0}
          onChange={(e) => seek(Number(e.target.value) / 1000)}
          aria-label="Seek"
          className="mt-5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/30 accent-white"
        />
        <div className="mt-1.5 flex justify-between text-[12px] tabular-nums opacity-60">
          <span>{fmtTime(current)}</span>
          <span>-{fmtTime(Math.max(0, duration - current))}</span>
        </div>
        <div className="mt-6 flex items-center justify-around">
          <button onClick={() => skip(-1)} aria-label="Previous">
            <Rewind className="size-10 fill-white" />
          </button>
          <button onClick={() => update('music', (m) => ({ ...m, playing: !m.playing }))} aria-label={playing ? 'Pause' : 'Play'}>
            {playing ? <Pause className="size-14 fill-white" /> : <Play className="size-14 fill-white" />}
          </button>
          <button onClick={() => skip(1)} aria-label="Next">
            <FastForward className="size-10 fill-white" />
          </button>
        </div>
        <button
          className="mx-auto mt-6 flex items-center gap-1.5 text-[13px] opacity-60"
          onClick={() =>
            update('music', (m) => ({
              ...m,
              tracks: m.tracks.filter((t) => t.id !== track.id),
              currentId: null,
              playing: false,
            }))
          }
        >
          <Trash2 className="size-3.5" /> Remove from library
        </button>
      </div>
    </motion.div>
  )
}
