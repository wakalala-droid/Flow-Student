import { cn } from '@/lib/utils'

interface PlanBadgeProps {
  plan: string
  className?: string
}

const styles: Record<string, string> = {
  free:    'bg-[#1c1c28] text-[#7a7a9a] border-white/[0.07]',
  student: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  pro:     'bg-[#6c63ff]/15 text-violet-300 border-[#6c63ff]/30',
  team:    'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
}
const icons: Record<string, string> = {
  free: '○', student: '◆', pro: '✦', team: '★',
}

export default function PlanBadge({ plan, className }: PlanBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border capitalize',
      styles[plan] ?? styles.free,
      className
    )}>
      {icons[plan] ?? '○'} {plan}
    </span>
  )
}
