import { cn } from '@/lib/utils'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: string
  title: string
  description?: string
  action?: { label: string; href?: string; onClick?: () => void }
  className?: string
}

export default function EmptyState({ icon = '✦', title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center h-full gap-3 text-center p-6', className)}>
      <span className="text-4xl opacity-20">{icon}</span>
      <div>
        <p className="text-sm font-medium text-[#e8e8f0]">{title}</p>
        {description && <p className="text-xs text-[#7a7a9a] mt-1 max-w-xs">{description}</p>}
      </div>
      {action && (
        action.href ? (
          <Link href={action.href} className="btn-primary text-xs py-2 px-4 mt-1">{action.label}</Link>
        ) : (
          <button onClick={action.onClick} className="btn-primary text-xs py-2 px-4 mt-1">{action.label}</button>
        )
      )}
    </div>
  )
}
