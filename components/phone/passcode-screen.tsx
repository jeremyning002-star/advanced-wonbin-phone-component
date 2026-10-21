'use client'

import { motion, useAnimationControls } from 'framer-motion'
import { useState } from 'react'
import { useOS } from '@/lib/phone/store'

const KEYS: [string, string][] = [
  ['1', ''],
  ['2', 'A B C'],
  ['3', 'D E F'],
  ['4', 'G H I'],
  ['5', 'J K L'],
  ['6', 'M N O'],
  ['7', 'P Q R S'],
  ['8', 'T U V'],
  ['9', 'W X Y Z'],
]

export function PasscodeScreen() {
  const { state, update } = useOS()
  const [code, setCode] = useState('')
  const controls = useAnimationControls()
  const length = state.device.passcode.length

  const unlock = () => update('device', (d) => ({ ...d, screen: 'home' }))

  const press = (digit: string) => {
    if (code.length >= length) return
    const next = code + digit
    setCode(next)
    if (next.length === length) {
      if (next === state.device.passcode) {
        setTimeout(unlock, 120)
      } else {
        controls.start({ x: [0, -18, 18, -12, 12, -5, 5, 0], transition: { duration: 0.45 } })
        setTimeout(() => setCode(''), 450)
      }
    }
  }

  return (
    <motion.div
      className="absolute inset-0 z-20 flex flex-col items-center text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.3 } }}
    >
      <div
        className="absolute inset-0 scale-110 bg-cover bg-center blur-2xl"
        style={{ backgroundImage: `url(${state.device.wallpaper})` }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/35" aria-hidden />

      <div className="relative mt-[110px] flex flex-col items-center">
        <h2 className="text-[20px] font-normal">Enter Passcode</h2>
        <motion.div animate={controls} className="mt-5 flex gap-[22px]" aria-label={`${code.length} of ${length} digits entered`}>
          {Array.from({ length }).map((_, i) => (
            <motion.span
              key={i}
              animate={{ scale: i < code.length ? [1.25, 1] : 1 }}
              className={`size-[13px] rounded-full border border-white ${i < code.length ? 'bg-white' : 'bg-transparent'}`}
            />
          ))}
        </motion.div>
      </div>

      <div className="relative mt-[60px] grid grid-cols-3 gap-x-[26px] gap-y-[16px]">
        {KEYS.map(([n, letters]) => (
          <KeyButton key={n} digit={n} letters={letters} onPress={press} />
        ))}
        <span />
        <KeyButton digit="0" letters="" onPress={press} />
        <span />
      </div>

      <div className="relative mt-auto mb-12 flex w-full justify-between px-[52px] text-[17px]">
        <button onClick={unlock} className="active:opacity-50">
          Face ID
        </button>
        <button
          onClick={() => (code ? setCode((c) => c.slice(0, -1)) : update('device', (d) => ({ ...d, screen: 'lock' })))}
          className="active:opacity-50"
        >
          {code ? 'Delete' : 'Cancel'}
        </button>
      </div>
    </motion.div>
  )
}

function KeyButton({ digit, letters, onPress }: { digit: string; letters: string; onPress: (d: string) => void }) {
  return (
    <motion.button
      whileTap={{ backgroundColor: 'rgba(255,255,255,0.7)' }}
      transition={{ duration: 0.05 }}
      onClick={() => onPress(digit)}
      className="flex size-[78px] flex-col items-center justify-center rounded-full bg-white/15 backdrop-blur-xl"
      aria-label={digit}
    >
      <span className="text-[36px] leading-none font-normal">{digit}</span>
      {letters && <span className="text-[10px] font-semibold tracking-[0.15em]">{letters}</span>}
    </motion.button>
  )
}
