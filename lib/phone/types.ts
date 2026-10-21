export type AppId =
  | 'line'
  | 'instagram'
  | 'phone'
  | 'safari'
  | 'notes'
  | 'clock'
  | 'calendar'
  | 'mail'
  | 'music'
  | 'settings'

export type Screen = 'lock' | 'passcode' | 'home'

export interface DeviceState {
  screen: Screen
  openApp: AppId | null
  clockMode: 'custom' | 'live'
  customTime: string
  customDate: string
  hour24: boolean
  battery: number
  charging: boolean
  wallpaper: string
  passcode: string
  carrier: string
  weather: { city: string; temp: number; condition: string; high: number; low: number }
}

export interface PhoneNotification {
  id: string
  app: AppId
  title: string
  message: string
  avatar?: string
  time: string
}

export interface CallInfo {
  name: string
  number: string
  avatar?: string
  app: 'phone' | 'line'
  video?: boolean
}

export interface LineMessage {
  id: string
  from: 'me' | 'them'
  type: 'text' | 'photo' | 'file' | 'location' | 'call'
  text: string
  url?: string
  time: string
  read?: boolean
}

export interface LineContact {
  id: string
  name: string
  avatar: string
  status: string
}

export interface LineChat {
  id: string
  contactId: string
  wallpaper: string
  unread: number
  muted?: boolean
  messages: LineMessage[]
}

export interface OpenChat {
  id: string
  name: string
  description: string
  cover: string
  members: number
  category: string
  joined: boolean
  messages: LineMessage[]
}

export interface LineState {
  myName: string
  myAvatar: string
  myStatus: string
  contacts: LineContact[]
  chats: LineChat[]
  openChats: OpenChat[]
}

export interface IgMedia {
  id: string
  type: 'photo' | 'video'
  url: string
  caption: string
  likes: number
  liked?: boolean
}

export interface IgStory {
  id: string
  user: string
  avatar: string
  type: 'photo' | 'video'
  url: string
  seen?: boolean
}

export interface InstagramState {
  profile: {
    username: string
    name: string
    bio: string
    avatar: string
    followers: number
    following: number
    link: string
  }
  posts: IgMedia[]
  reels: IgMedia[]
  stories: IgStory[]
  badge: number
}

export interface MailItem {
  id: string
  from: string
  email: string
  subject: string
  body: string
  date: string
  unread: boolean
  folder: 'inbox' | 'sent'
}

export interface SafariTab {
  id: string
  url: string
  title: string
}

export interface SafariState {
  tabs: SafariTab[]
  activeTabId: string
  bookmarks: { id: string; title: string; url: string }[]
}

export interface Track {
  id: string
  title: string
  artist: string
  url: string
  cover: string
  type: 'audio' | 'video'
}

export interface Playlist {
  id: string
  name: string
  trackIds: string[]
}

export interface MusicState {
  tracks: Track[]
  playlists: Playlist[]
  currentId: string | null
  playing: boolean
}

export interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  notes: string
  kind: 'event' | 'reminder'
  color: string
}

export interface Alarm {
  id: string
  time: string
  label: string
  enabled: boolean
}

export interface Note {
  id: string
  title: string
  body: string
  date: string
}

export interface Contact {
  id: string
  name: string
  number: string
  avatar?: string
}

export interface RecentCall {
  id: string
  name: string
  number: string
  kind: 'incoming' | 'outgoing' | 'missed'
  date: string
}

export interface PhoneState {
  contacts: Contact[]
  recents: RecentCall[]
}

export interface OSState {
  device: DeviceState
  notifications: PhoneNotification[]
  banner: PhoneNotification | null
  incomingCall: CallInfo | null
  activeCall: (CallInfo & { startedAt: number }) | null
  line: LineState
  instagram: InstagramState
  mail: MailItem[]
  safari: SafariState
  music: MusicState
  calendar: CalendarEvent[]
  alarms: Alarm[]
  notes: Note[]
  phone: PhoneState
}
