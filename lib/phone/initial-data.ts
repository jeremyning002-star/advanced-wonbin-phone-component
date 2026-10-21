import type { OSState } from './types'

const SAMPLE_VIDEO_1 = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
const SAMPLE_VIDEO_2 = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4'
const SAMPLE_VIDEO_3 = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'

export const initialState: OSState = {
  device: {
    screen: 'lock',
    openApp: null,
    clockMode: 'custom',
    customTime: '16:38',
    customDate: 'Tuesday, October 20',
    hour24: true,
    battery: 47,
    charging: false,
    wallpaper: '/images/wallpaper.png',
    passcode: '123456',
    carrier: 'TRUE-H',
    weather: { city: 'Bangkok', temp: 29, condition: 'Sunny', high: 32, low: 25 },
  },
  notifications: [
    {
      id: 'n1',
      app: 'line',
      title: 'Wonbin',
      message: 'Are you coming to the studio later?',
      avatar: '/images/avatar-1.png',
      time: '16:21',
    },
    {
      id: 'n2',
      app: 'mail',
      title: 'Airline Booking',
      message: 'Your e-ticket for flight TG 658 is ready',
      time: '15:02',
    },
  ],
  banner: null,
  incomingCall: null,
  activeCall: null,
  line: {
    myName: 'Moxi',
    myAvatar: '/images/avatar-2.png',
    myStatus: 'good night ☾',
    contacts: [
      { id: 'c1', name: 'Wonbin', avatar: '/images/avatar-1.png', status: 'in the studio' },
      { id: 'c2', name: 'Mina', avatar: '/images/avatar-2.png', status: 'coffee first' },
      { id: 'c3', name: 'Work Team', avatar: '/images/post-2.png', status: '12 members' },
    ],
    chats: [
      {
        id: 'ch1',
        contactId: 'c1',
        wallpaper: '#8CABD9',
        unread: 2,
        messages: [
          { id: 'm1', from: 'them', type: 'text', text: 'Hey! Did you get the tickets?', time: '16:10', read: true },
          { id: 'm2', from: 'me', type: 'text', text: 'Yes! Row C, seats 12 and 13', time: '16:12', read: true },
          { id: 'm3', from: 'them', type: 'photo', text: '', url: '/images/post-1.png', time: '16:20' },
          { id: 'm4', from: 'them', type: 'text', text: 'Are you coming to the studio later?', time: '16:21' },
        ],
      },
      {
        id: 'ch2',
        contactId: 'c2',
        wallpaper: '#F2D7C9',
        unread: 1,
        messages: [
          { id: 'm5', from: 'me', type: 'text', text: 'Beach trip this weekend?', time: '11:02', read: true },
          { id: 'm6', from: 'them', type: 'location', text: 'Hua Hin Beach, Prachuap Khiri Khan', time: '11:40' },
        ],
      },
      {
        id: 'ch3',
        contactId: 'c3',
        wallpaper: '#D6E4D2',
        unread: 0,
        messages: [
          { id: 'm7', from: 'them', type: 'file', text: 'Q4_Report_Final.pdf', time: 'Yesterday' },
          { id: 'm8', from: 'me', type: 'text', text: 'Thanks, reviewing now.', time: 'Yesterday', read: true },
        ],
      },
    ],
    openChats: [
      {
        id: 'oc1',
        name: 'Bangkok Cafe Hoppers',
        description: 'Share your favourite cafes around the city.',
        cover: '/images/post-1.png',
        members: 1284,
        category: 'Food',
        joined: true,
        messages: [
          { id: 'om1', from: 'them', type: 'text', text: 'New matcha place in Ari is amazing', time: '14:02' },
        ],
      },
      {
        id: 'oc2',
        name: 'Night City Photography',
        description: 'Street & neon photography community.',
        cover: '/images/post-2.png',
        members: 532,
        category: 'Hobby',
        joined: false,
        messages: [],
      },
    ],
  },
  instagram: {
    profile: {
      username: 'goodnight.moxi',
      name: 'Moxi',
      bio: 'film photos & late night coffee\nBangkok · Seoul',
      avatar: '/images/avatar-2.png',
      followers: 12840,
      following: 318,
      link: 'moxi.studio',
    },
    posts: [
      { id: 'p1', type: 'photo', url: '/images/post-1.png', caption: 'slow mornings', likes: 1204 },
      { id: 'p2', type: 'photo', url: '/images/post-2.png', caption: 'tokyo after dark', likes: 2391 },
      { id: 'p3', type: 'photo', url: '/images/post-3.png', caption: 'summer never ends', likes: 3102 },
    ],
    reels: [
      { id: 'r1', type: 'video', url: SAMPLE_VIDEO_1, caption: 'weekend vibes', likes: 8420 },
      { id: 'r2', type: 'video', url: SAMPLE_VIDEO_2, caption: 'road trip', likes: 5120 },
      { id: 'r3', type: 'video', url: SAMPLE_VIDEO_3, caption: 'escape', likes: 2033 },
    ],
    stories: [
      { id: 's1', user: 'wonbin', avatar: '/images/avatar-1.png', type: 'photo', url: '/images/post-2.png' },
      { id: 's2', user: 'mina.k', avatar: '/images/avatar-2.png', type: 'photo', url: '/images/post-3.png' },
      { id: 's3', user: 'travel.daily', avatar: '/images/post-3.png', type: 'video', url: SAMPLE_VIDEO_2 },
    ],
    badge: 1,
  },
  mail: [
    {
      id: 'e1',
      from: 'Airline Booking',
      email: 'noreply@airline.com',
      subject: 'Your e-ticket for flight TG 658',
      body: 'Dear Moxi,\n\nThank you for booking with us. Your e-ticket for flight TG 658 from Bangkok (BKK) to Seoul (ICN) on October 24 is attached.\n\nPlease arrive at the airport at least 2 hours before departure.\n\nSafe travels!',
      date: '15:02',
      unread: true,
      folder: 'inbox',
    },
    {
      id: 'e2',
      from: 'Studio Weekly',
      email: 'hello@studioweekly.co',
      subject: 'This week in design',
      body: 'Hi there,\n\nHere are the top stories in design this week: new type foundries, a deep-dive into motion systems, and our favourite portfolios.\n\nSee you next week.',
      date: 'Yesterday',
      unread: true,
      folder: 'inbox',
    },
    {
      id: 'e3',
      from: 'Wonbin',
      email: 'wonbin@mail.com',
      subject: 'Photos from Saturday',
      body: 'Uploaded everything to the shared album. Let me know which ones you want printed!',
      date: 'Monday',
      unread: false,
      folder: 'inbox',
    },
  ],
  safari: {
    tabs: [{ id: 't1', url: 'apple.com', title: 'Apple' }],
    activeTabId: 't1',
    bookmarks: [
      { id: 'b1', title: 'Apple', url: 'apple.com' },
      { id: 'b2', title: 'Wikipedia', url: 'wikipedia.org' },
      { id: 'b3', title: 'YouTube', url: 'youtube.com' },
      { id: 'b4', title: 'News', url: 'news.example.com' },
    ],
  },
  music: {
    tracks: [
      {
        id: 'tr1',
        title: 'Midnight Drive',
        artist: 'SoundHelix',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover: '/images/post-2.png',
        type: 'audio',
      },
      {
        id: 'tr2',
        title: 'Summer Haze',
        artist: 'SoundHelix',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cover: '/images/post-3.png',
        type: 'audio',
      },
      {
        id: 'tr3',
        title: 'Latte Morning',
        artist: 'SoundHelix',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cover: '/images/post-1.png',
        type: 'audio',
      },
      {
        id: 'tr4',
        title: 'Joyride (Video)',
        artist: 'Blender Studio',
        url: SAMPLE_VIDEO_2,
        cover: '/images/post-2.png',
        type: 'video',
      },
    ],
    playlists: [
      { id: 'pl1', name: 'Late Night', trackIds: ['tr1', 'tr3'] },
      { id: 'pl2', name: 'Roadtrip', trackIds: ['tr2', 'tr4'] },
    ],
    currentId: 'tr1',
    playing: false,
  },
  calendar: [
    { id: 'ev1', title: 'Studio session', date: '2026-10-20', time: '18:00', notes: 'Bring the film camera', kind: 'event', color: '#FF3B30' },
    { id: 'ev2', title: 'Flight to Seoul', date: '2026-10-24', time: '09:30', notes: 'TG 658', kind: 'event', color: '#007AFF' },
    { id: 'ev3', title: 'Pay rent', date: '2026-10-28', time: '10:00', notes: '', kind: 'reminder', color: '#FF9500' },
  ],
  alarms: [
    { id: 'a1', time: '06:30', label: 'Wake up', enabled: true },
    { id: 'a2', time: '07:15', label: 'Gym', enabled: false },
    { id: 'a3', time: '22:00', label: 'Wind down', enabled: true },
  ],
  notes: [
    { id: 'no1', title: 'Seoul packing list', body: 'Passport\nFilm rolls x4\nCharger\nWarm jacket', date: 'Today' },
    { id: 'no2', title: 'Cafe ideas', body: 'Matcha bar in Ari\nRoastery near Thonglor', date: 'Yesterday' },
  ],
  phone: {
    contacts: [
      { id: 'pc1', name: 'Wonbin', number: '+66 81 234 5678', avatar: '/images/avatar-1.png' },
      { id: 'pc2', name: 'Mina', number: '+66 89 765 4321', avatar: '/images/avatar-2.png' },
      { id: 'pc3', name: 'Mom', number: '+66 2 123 4567' },
    ],
    recents: [
      { id: 'rc1', name: 'Wonbin', number: '+66 81 234 5678', kind: 'missed', date: '15:44' },
      { id: 'rc2', name: 'Mom', number: '+66 2 123 4567', kind: 'incoming', date: 'Yesterday' },
      { id: 'rc3', name: 'Mina', number: '+66 89 765 4321', kind: 'outgoing', date: 'Monday' },
    ],
  },
}
