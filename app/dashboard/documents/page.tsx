'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, truncate } from '@/lib/utils'
import type { AIScan } from '@/types'

const TOOL_ICONS: Record<string, string> = {
  humanizer: '✨', detector: '🔍', plagiarism: '📋',
  paraphraser: '🔄', grammar: '✅', factcheck: '🧾',
  seo: '📈', tone: '🎭', citation: '📚',
}
const TOOL_LABELS: Record<string, string> = {
  humanizer: 'Humanized', detector: 'AI Detected', plagiarism: 'Plagiarism Checked',
  paraphraser: 'Paraphrased', grammar: 'Grammar Fixed', factcheck: 'Fact Checked',
  seo: 'SEO Optimised', tone: 'Tone Rewritten', citation: 'Citations Generated',
}

export default function DocumentsPage() {
  const [scans, setScans] = useState<AIScan[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<AIScan | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('ai_scans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100)
        .then(({ data }) => { setScans(data ?? []); setLoading(false) })
    })
  }, [])

  const tools = ['all', 'humanizer', 'detector', 'plagiarism', 'paraphraser', 'grammar', 'factcheck', 'seo', 'tone', 'citation']
  const filtered = filter === 'all' ? scans : scans.filter(s => s.tool === filter)

  return (
    <div className="h-full flex overflow-hidden">
      {/* List */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-5 pb-3 border-b border-white/[0.07]">
          <h1 className="text-lg font-semibold text-[#e8e8f0] mb-3">Documents & History</h1>
          <div className="flex gap-1.5 flex-wrap">
            {tools.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={`chip text-[11px] ${filter === t ? 'chip-active' : ''}`}>
                {t === 'all' ? 'All' : TOOL_ICONS[t] + ' ' + TOOL_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-2">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-16 rounded-lg" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#7a7a9a]">
              <span className="text-4xl opacity-20">📁</span>
              <p className="text-sm">No documents yet. Run a tool to get started.</p>
            </div>
          ) : filtered.map(scan => (
            <div key={scan.id}
              onClick={() => setSelected(scan)}
              className={`card card-hover p-4 cursor-pointer flex items-start gap-3 ${selected?.id === scan.id ? 'border-[#6c63ff]/40' : ''}`}>
              <span className="text-xl flex-shrink-0">{TOOL_ICONS[scan.tool]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-[#e8e8f0]">{TOOL_LABELS[scan.tool]}</span>
                  <span className="badge badge-blue text-[9px]">{scan.word_count} words</span>
                </div>
                <p className="text-[11px] text-[#7a7a9a] truncate">{truncate(scan.input_text, 120)}</p>
              </div>
              <span className="text-[10px] text-[#7a7a9a] flex-shrink-0 mt-0.5">{formatDate(scan.created_at)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel */}
      {selected && (
        <div className="w-80 flex-shrink-0 border-l border-white/[0.07] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/[0.07] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#e8e8f0]">{TOOL_ICONS[selected.tool]} {TOOL_LABELS[selected.tool]}</span>
            <button onClick={() => setSelected(null)} className="btn-ghost text-xs">✕</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Input</p>
              <p className="text-xs text-[#e8e8f0] leading-relaxed bg-[#16161f] rounded-lg p-3">{selected.input_text}</p>
            </div>
            {selected.output_text && (
              <div>
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Output</p>
                <p className="text-xs text-[#e8e8f0] leading-relaxed bg-[#16161f] rounded-lg p-3">{selected.output_text}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div className="card p-3 text-center">
                <p className="text-[10px] text-[#7a7a9a]">Words</p>
                <p className="text-sm font-semibold text-[#e8e8f0]">{selected.word_count}</p>
              </div>
              <div className="card p-3 text-center">
                <p className="text-[10px] text-[#7a7a9a]">Date</p>
                <p className="text-sm font-semibold text-[#e8e8f0]">{formatDate(selected.created_at)}</p>
              </div>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(selected.output_text || selected.input_text)}
              className="btn-secondary w-full justify-center text-xs py-2">
              ⎘ Copy Output
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
