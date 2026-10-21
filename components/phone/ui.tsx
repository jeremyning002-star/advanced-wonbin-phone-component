'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ImagePlus } from 'lucide-react'
import { useId, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function NavHeader({
  title,
  onBack,
  backLabel = 'Back',
  right,
  large,
  className,
  tint = 'text-[#007AFF]',
}: {
  title?: ReactNode
  onBack?: () => void
  backLabel?: string
  right?: ReactNode
  large?: boolean
  className?: string
  tint?: string
}) {
  return (
    <div className={cn('shrink-0 px-4 pb-2', className)}>
      <div className="relative flex h-11 items-center justify-between">
        <div className="z-10 flex min-w-16 items-center">
          {onBack && (
            <button onClick={onBack} className={cn('-ml-2 flex items-center text-[17px] active:opacity-50', tint)}>
              <ChevronLeft className="size-7" strokeWidth={2.2} />
              <span className="-ml-1">{backLabel}</span>
            </button>
          )}
        </div>
        {!large && title && (
          <div className="pointer-events-none absolute inset-x-20 truncate text-center text-[17px] font-semibold">{title}</div>
        )}
        <div className={cn('z-10 flex min-w-16 items-center justify-end gap-4', tint)}>{right}</div>
      </div>
      {large && title && <h1 className="mt-1 text-[34px] leading-tight font-bold tracking-tight">{title}</h1>}
    </div>
  )
}

export function Sheet({
  open,
  onClose,
  title,
  onSave,
  saveLabel = 'Done',
  children,
  danger,
}: {
  open: boolean
  onClose: () => void
  title: string
  onSave?: () => void
  saveLabel?: string
  children: ReactNode
  danger?: { label: string; onClick: () => void }
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-[60] flex flex-col justify-end bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label={title}
            className="flex max-h-[88%] flex-col rounded-t-[14px] bg-[#F2F2F7] text-black"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mt-2 h-1.5 w-9 rounded-full bg-black/20" />
            <div className="flex items-center justify-between px-4 py-3">
              <button onClick={onClose} className="text-[17px] text-[#007AFF] active:opacity-50">
                Cancel
              </button>
              <span className="text-[17px] font-semibold">{title}</span>
              <button
                onClick={() => {
                  onSave?.()
                  onClose()
                }}
                className="text-[17px] font-semibold text-[#007AFF] active:opacity-50"
              >
                {saveLabel}
              </button>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-10">
              {children}
              {danger && (
                <button
                  onClick={() => {
                    danger.onClick()
                    onClose()
                  }}
                  className="rounded-[10px] bg-white py-3 text-[17px] text-[#FF3B30] active:bg-black/5"
                >
                  {danger.label}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function FormGroup({ children, label }: { children: ReactNode; label?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="px-4 text-[13px] uppercase text-black/50">{label}</span>}
      <div className="divide-y divide-black/10 overflow-hidden rounded-[10px] bg-white">{children}</div>
    </div>
  )
}

export function Field({
  label,
  value,
  onChange,
  type = 'text',
  multiline,
  placeholder,
}: {
  label: string
  value: string | number
  onChange: (v: string) => void
  type?: string
  multiline?: boolean
  placeholder?: string
}) {
  const id = useId()
  return (
    <div className={cn('flex gap-3 px-4 py-2.5', multiline ? 'flex-col' : 'items-center')}>
      <label htmlFor={id} className="w-24 shrink-0 text-[15px] text-black/60">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full resize-none bg-transparent text-[16px] outline-none"
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-right text-[16px] outline-none"
        />
      )}
    </div>
  )
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  const id = useId()
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <label htmlFor={id} className="w-24 shrink-0 text-[15px] text-black/60">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="min-w-0 flex-1 bg-transparent text-right text-[16px] outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function readFileAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function MediaField({
  label,
  value,
  onChange,
  accept = 'image/*',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  accept?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <label htmlFor={id} className="w-24 shrink-0 text-[15px] text-black/60">
        {label}
      </label>
      <input
        id={id}
        value={value.startsWith('data:') ? '(uploaded file)' : value}
        placeholder="https://..."
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-right text-[14px] outline-none"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="grid size-8 shrink-0 place-items-center rounded-full bg-[#007AFF]/10 text-[#007AFF]"
        aria-label={`Upload ${label}`}
      >
        <ImagePlus className="size-4" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (f) onChange(f.type.startsWith('video') || f.type.startsWith('audio') ? URL.createObjectURL(f) : await readFileAsDataURL(f))
        }}
      />
    </div>
  )
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors', checked ? 'bg-[#34C759]' : 'bg-[#E9E9EA]')}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 600, damping: 35 }}
        className={cn(
          'absolute top-[2px] size-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]',
          checked ? 'right-[2px]' : 'left-[2px]',
        )}
      />
    </button>
  )
}

export function Avatar({ src, name, size = 40, className }: { src?: string; name: string; size?: number; className?: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={cn('shrink-0 rounded-full object-cover', className)}
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#A5ABB8] to-[#858994] font-semibold text-white',
        className,
      )}
      aria-label={name}
    >
      {name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()}
    </div>
  )
}

export function TabBar<T extends string>({
  tabs,
  active,
  onChange,
  tint = '#007AFF',
  dark,
}: {
  tabs: { id: T; label: string; icon: ReactNode }[]
  active: T
  onChange: (t: T) => void
  tint?: string
  dark?: boolean
}) {
  return (
    <nav
      className={cn(
        'flex shrink-0 justify-around border-t pt-1.5 pb-7 backdrop-blur-xl',
        dark ? 'border-white/10 bg-black/90' : 'border-black/10 bg-[#F9F9F9]/90',
      )}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className="flex w-16 flex-col items-center gap-0.5 text-[10px] font-medium active:opacity-60"
          style={{ color: active === t.id ? tint : dark ? '#8E8E93' : '#999999' }}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </nav>
  )
}
