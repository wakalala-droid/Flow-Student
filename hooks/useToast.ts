'use client'
import { useState, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { ToastType } from '@/components/shared/Toast'

interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = nanoid(6)
    setToasts(prev => [...prev, { id, message, type }])
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const success = useCallback((msg: string) => add(msg, 'success'), [add])
  const error   = useCallback((msg: string) => add(msg, 'error'),   [add])
  const info    = useCallback((msg: string) => add(msg, 'info'),    [add])
  const warning = useCallback((msg: string) => add(msg, 'warning'), [add])

  return { toasts, add, remove, success, error, info, warning }
}
