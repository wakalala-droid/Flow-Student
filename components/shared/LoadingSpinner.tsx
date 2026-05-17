import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  label?: string
}

export default function LoadingSpinner({ size = 'md', className, label }: LoadingSpinnerProps) {
  const sizes = { sm: 'w-4 h-4 border', md: 'w-7 h-7 border-2', lg: 'w-10 h-10 border-2' }
  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className={cn('rounded-full border-white/10 border-t-[#6c63ff] animate-spin', sizes[size])} />
      {label && <p className="text-xs text-[#7a7a9a]">{label}</p>}
    </div>
  )
}
