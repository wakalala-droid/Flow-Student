import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function countChars(text: string): number {
  return text.length
}

export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim()).length
}

export function readingTime(text: string): number {
  return Math.ceil(countWords(text) / 200)
}

export function truncate(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + '…' : text
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-ZM', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

export function formatZMW(amount: number): string {
  return `ZMW ${amount.toFixed(2)}`
}

export function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 60) return 'text-orange-400'
  return 'text-red-400'
}

export function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-400/15'
  if (score >= 60) return 'bg-orange-400/15'
  return 'bg-red-400/15'
}

export function planLimits(plan: string) {
  const limits: Record<string, { words: number; scans: number }> = {
    free: { words: 5000, scans: 10 },
    student: { words: 20000, scans: 50 },
    pro: { words: 50000, scans: 200 },
    team: { words: 200000, scans: 1000 },
  }
  return limits[plan] ?? limits.free
}
