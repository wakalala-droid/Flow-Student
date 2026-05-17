'use client'
import { cn } from '@/lib/utils'

interface ControlCardProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function ControlCard({ title, children, className }: ControlCardProps) {
  return (
    <div className={cn('card p-3.5', className)}>
      <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">{title}</p>
      {children}
    </div>
  )
}

interface SliderControlProps {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  id: string
}

export function SliderControl({ label, value, onChange, min = 1, max = 100, id }: SliderControlProps) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-[11px] mb-1.5">
        <label htmlFor={id} className="text-[#7a7a9a]">{label}</label>
        <span className="text-violet-400 font-semibold">{value}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1 bg-[#1c1c28] rounded-full appearance-none cursor-pointer accent-[#6c63ff]"
      />
    </div>
  )
}

interface ChipGroupProps {
  options: string[]
  value: string
  onChange: (v: string) => void
}

export function ChipGroup({ options, value, onChange }: ChipGroupProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={cn('chip text-[10px]', value === opt && 'chip-active')}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

interface SelectControlProps {
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}

export function SelectControl({ label, value, onChange, options }: SelectControlProps) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-[11px] text-[#7a7a9a] mb-1.5">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="input text-xs py-1.5"
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}
