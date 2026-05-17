import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  color?: 'purple' | 'green' | 'orange' | 'red' | 'blue'
  height?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

const colorMap = {
  purple: 'from-[#6c63ff] to-violet-400',
  green:  'from-emerald-400 to-emerald-500',
  orange: 'from-orange-400 to-orange-500',
  red:    'from-red-400 to-red-500',
  blue:   'from-blue-400 to-blue-500',
}
const heightMap = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }

export default function ProgressBar({ value, max = 100, color = 'purple', height = 'sm', showLabel, className }: ProgressBarProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100)
  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-[10px] text-[#7a7a9a] mb-1">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
      <div className={cn('bg-[#1c1c28] rounded-full overflow-hidden', heightMap[height])}>
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', colorMap[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
