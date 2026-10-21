'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { OSProvider } from '@/lib/phone/store'
import { ControlPanel } from './control-panel'
import { PhoneDevice, SCREEN_H, SCREEN_W, useFitScale } from './phone-device'

function SimulatorInner({ onReset }: { onReset: () => void }) {
  const { ref, scale } = useFitScale(40)
  const [mobilePanel, setMobilePanel] = useState(false)

  return (
    <main className="flex h-dvh w-full overflow-hidden bg-[radial-gradient(ellipse_at_top,#2a2d3a_0%,#0d0e12_70%)]">
      <h1 className="sr-only">iPhone OS Simulator</h1>
      <div ref={ref} className="relative flex flex-1 items-center justify-center">
        <div style={{ width: (SCREEN_W + 26) * scale, height: (SCREEN_H + 26) * scale }}>
          <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
            <PhoneDevice onIslandClick={() => setMobilePanel((o) => !o)} />
          </div>
        </div>
        <button
          onClick={() => setMobilePanel(true)}
          className="absolute right-4 bottom-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white backdrop-blur-xl lg:hidden"
        >
          <SlidersHorizontal className="size-4" /> Controller
        </button>
      </div>

      <aside className="hidden w-[360px] shrink-0 border-l border-white/10 bg-[#141518]/80 backdrop-blur-xl lg:block" aria-label="OS controller">
        <ControlPanel onReset={onReset} />
      </aside>

      <AnimatePresence>
        {mobilePanel && (
          <motion.aside
            className="fixed inset-y-0 right-0 z-[200] w-full max-w-[380px] bg-[#141518] shadow-2xl lg:hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            aria-label="OS controller"
          >
            <ControlPanel onReset={onReset} onClose={() => setMobilePanel(false)} />
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  )
}

export function Simulator() {
  const [key, setKey] = useState(0)
  return (
    <OSProvider key={key}>
      <SimulatorInner onReset={() => setKey((k) => k + 1)} />
    </OSProvider>
  )
}
