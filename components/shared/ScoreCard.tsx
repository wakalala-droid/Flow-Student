'use client'
import { cn } from '@/lib/utils'

interface ScoreCardProps {
  label: string
  value: string | number
  sub?: string
  color?: 'green' | 'orange' | 'red' | 'blue' | 'purple' | 'default'
  progress?: number
  className?: string
}

const colorMap = {
  green:  { text: 'text-emerald-400', bar: 'from-emerald-400 to-emerald-500' },
  orange: { text: 'text-orange-400',  bar: 'from-orange-400 to-orange-500' },
  red:    { text: 'text-red-400',     bar: 'from-red-400 to-red-500' },
  blue:   { text: 'text-blue-400',    bar: 'from-blue-400 to-blue-500' },
  purple: { text: 'text-violet-400',  bar: 'from-[#6c63ff] to-violet-400' },
  default:{ text: 'text-[#e8e8f0]',  bar: 'from-[#6c63ff] to-violet-400' },
}

export default function ScoreCard({ label, value, sub, color = 'default', progress, className }: ScoreCardProps) {
  const c = colorMap[color]
  return (
    <div className={cn('card p-3.5 flex flex-col gap-1', className)}>
      <span className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">{label}</span>
      <span className={cn('text-2xl font-bold leading-none tracking-tight', c.text)}>{value}</span>
      {sub && <span className="text-[11px] text-[#7a7a9a]">{sub}</span>}
      {progress !== undefined && (
        <div className="h-1 bg-[#1c1c28] rounded-full overflow-hidden mt-1">
          <div className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', c.bar)} style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      )}
    </div>
  )
}
