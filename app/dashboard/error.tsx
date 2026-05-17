'use client'
import { useEffect } from 'react'

export default function DashboardError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error('Dashboard error:', error) }, [error])

  return (
    <div className="h-full flex items-center justify-center p-6">
      <div className="card p-8 max-w-sm w-full text-center space-y-4">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-semibold text-[#e8e8f0]">Something went wrong</h2>
        <p className="text-sm text-[#7a7a9a]">{error.message || 'An unexpected error occurred.'}</p>
        <div className="flex gap-3">
          <button onClick={reset} className="btn-primary flex-1 justify-center py-2.5 text-xs">Try again</button>
          <a href="/dashboard/humanizer" className="btn-secondary flex-1 justify-center py-2.5 text-xs">Go home</a>
        </div>
      </div>
    </div>
  )
}
