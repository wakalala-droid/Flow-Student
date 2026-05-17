'use client'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface ToastProps {
  message: string
  type?: ToastType
  duration?: number
  onClose: () => void
}

const styles: Record<ToastType, string> = {
  success: 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400',
  error:   'bg-red-400/10 border-red-400/30 text-red-400',
  info:    'bg-blue-400/10 border-blue-400/30 text-blue-400',
  warning: 'bg-orange-400/10 border-orange-400/30 text-orange-400',
}
const icons: Record<ToastType, string> = {
  success: '✓', error: '✕', info: 'ℹ', warning: '⚠',
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [duration, onClose])

  return (
    <div className={cn('flex items-center gap-2.5 px-4 py-3 rounded-lg border text-sm animate-fade-in shadow-xl', styles[type])}>
      <span className="font-bold flex-shrink-0">{icons[type]}</span>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100 text-xs">✕</button>
    </div>
  )
}

// Toast container — place in layout
export function ToastContainer({ toasts, remove }: { toasts: { id: string; message: string; type: ToastType }[]; remove: (id: string) => void }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-xs w-full">
      {toasts.map(t => (
        <Toast key={t.id} message={t.message} type={t.type} onClose={() => remove(t.id)} />
      ))}
    </div>
  )
}
