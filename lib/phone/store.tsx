'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { initialState } from './initial-data'
import type { AppId, CallInfo, OSState, PhoneNotification } from './types'

type Updater<T> = T | ((prev: T) => T)

interface OSContextValue {
  state: OSState
  update: <K extends keyof OSState>(key: K, value: Updater<OSState[K]>) => void
  openApp: (app: AppId | null) => void
  pushNotification: (n: Omit<PhoneNotification, 'id' | 'time'>) => void
  triggerIncomingCall: (call: CallInfo) => void
  answerCall: () => void
  declineCall: () => void
  startCall: (call: CallInfo) => void
  endCall: () => void
  now: Date
}

const OSContext = createContext<OSContextValue | null>(null)

export const uid = () => Math.random().toString(36).slice(2, 10)

export function formatClock(date: Date, hour24: boolean) {
  const h = date.getHours()
  const m = date.getMinutes().toString().padStart(2, '0')
  if (hour24) return `${h.toString().padStart(2, '0')}:${m}`
  return `${h % 12 || 12}:${m}`
}

export function useDisplayTime() {
  const { state, now } = useOS()
  const d = state.device
  if (d.clockMode === 'custom') {
    return { time: d.customTime, date: d.customDate }
  }
  return {
    time: formatClock(now, d.hour24),
    date: now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
  }
}

export function OSProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OSState>(initialState)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const update = useCallback(<K extends keyof OSState>(key: K, value: Updater<OSState[K]>) => {
    setState((prev) => ({
      ...prev,
      [key]: typeof value === 'function' ? (value as (p: OSState[K]) => OSState[K])(prev[key]) : value,
    }))
  }, [])

  const openApp = useCallback((app: AppId | null) => {
    setState((prev) => ({ ...prev, device: { ...prev.device, openApp: app } }))
  }, [])

  const pushNotification = useCallback((n: Omit<PhoneNotification, 'id' | 'time'>) => {
    const notif: PhoneNotification = { ...n, id: uid(), time: formatClock(new Date(), true) }
    setState((prev) => {
      const next = { ...prev, banner: notif, notifications: [notif, ...prev.notifications] }
      if (n.app === 'line') {
        const contact = prev.line.contacts.find((c) => c.name === n.title)
        if (contact) {
          next.line = {
            ...prev.line,
            chats: prev.line.chats.map((ch) =>
              ch.contactId === contact.id
                ? {
                    ...ch,
                    unread: ch.unread + 1,
                    messages: [...ch.messages, { id: uid(), from: 'them', type: 'text', text: n.message, time: notif.time }],
                  }
                : ch,
            ),
          }
        }
      }
      if (n.app === 'mail') {
        next.mail = [
          {
            id: uid(),
            from: n.title,
            email: `${n.title.toLowerCase().replace(/\s+/g, '.')}@mail.com`,
            subject: n.message,
            body: n.message,
            date: notif.time,
            unread: true,
            folder: 'inbox',
          },
          ...prev.mail,
        ]
      }
      if (n.app === 'instagram') {
        next.instagram = { ...prev.instagram, badge: prev.instagram.badge + 1 }
      }
      return next
    })
  }, [])

  const triggerIncomingCall = useCallback((call: CallInfo) => {
    setState((prev) => ({ ...prev, incomingCall: call }))
  }, [])

  const addRecent = (prev: OSState, call: CallInfo, kind: 'incoming' | 'outgoing' | 'missed'): OSState => {
    if (call.app !== 'phone') return prev
    return {
      ...prev,
      phone: {
        ...prev.phone,
        recents: [
          { id: uid(), name: call.name, number: call.number, kind, date: formatClock(new Date(), true) },
          ...prev.phone.recents,
        ],
      },
    }
  }

  const answerCall = useCallback(() => {
    setState((prev) => {
      if (!prev.incomingCall) return prev
      const withRecent = addRecent(prev, prev.incomingCall, 'incoming')
      return { ...withRecent, activeCall: { ...prev.incomingCall, startedAt: Date.now() }, incomingCall: null }
    })
  }, [])

  const declineCall = useCallback(() => {
    setState((prev) => {
      if (!prev.incomingCall) return prev
      return { ...addRecent(prev, prev.incomingCall, 'missed'), incomingCall: null }
    })
  }, [])

  const startCall = useCallback((call: CallInfo) => {
    setState((prev) => ({ ...addRecent(prev, call, 'outgoing'), activeCall: { ...call, startedAt: Date.now() } }))
  }, [])

  const endCall = useCallback(() => {
    setState((prev) => ({ ...prev, activeCall: null }))
  }, [])

  const value = useMemo(
    () => ({ state, update, openApp, pushNotification, triggerIncomingCall, answerCall, declineCall, startCall, endCall, now }),
    [state, update, openApp, pushNotification, triggerIncomingCall, answerCall, declineCall, startCall, endCall, now],
  )

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>
}

export function useOS() {
  const ctx = useContext(OSContext)
  if (!ctx) throw new Error('useOS must be used inside OSProvider')
  return ctx
}
