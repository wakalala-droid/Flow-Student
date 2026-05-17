'use client'
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

export default function SEOPage() {
  const [keyword, setKeyword] = useState('')

  return (
    <ToolShell
      toolKey="seo"
      outputLabel="SEO Analysis"
      placeholder="Paste your content to optimise for search engines…"
      runLabel="Optimise SEO"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Target Keyword</p>
            <input
              type="text" value={keyword} onChange={e => setKeyword(e.target.value)}
              placeholder="e.g. study tips" className="input text-xs py-2"
            />
          </div>
          <button onClick={() => state.run({ targetKeyword: keyword })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">▶ Analyse SEO</button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as {
          score?: number; optimizedText?: string; metaDescription?: string
          suggestedTitle?: string; keywords?: string[]
          checks?: { name: string; status: string; detail: string }[]
          readabilityGrade?: string
        }
        const checks = r.checks ?? []
        const statusIcon: Record<string, string> = { pass: '✓', warn: '⚠', fail: '✗' }
        const statusColor: Record<string, string> = {
          pass: 'text-emerald-400', warn: 'text-orange-400', fail: 'text-red-400',
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="SEO Score" value={`${r.score ?? 0}/100`} progress={r.score}
                color={r.score! >= 80 ? 'green' : r.score! >= 60 ? 'orange' : 'red'} />
              <ScoreCard label="Readability" value={r.readabilityGrade ?? '—'} color="blue" />
              <ScoreCard label="Keywords" value={r.keywords?.length ?? 0} color="purple" />
            </div>

            {r.suggestedTitle && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1.5">Suggested Title</p>
                <p className="text-sm text-emerald-400 font-medium">{r.suggestedTitle}</p>
              </div>
            )}

            {r.metaDescription && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1.5">Meta Description</p>
                <p className="text-xs text-[#e8e8f0] leading-relaxed">{r.metaDescription}</p>
                <p className="text-[10px] text-[#7a7a9a] mt-1">{r.metaDescription.length}/160 chars</p>
              </div>
            )}

            {checks.length > 0 && (
              <div className="card p-3.5 space-y-2">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1">SEO Checklist</p>
                {checks.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className={cn('text-xs font-bold flex-shrink-0 mt-0.5', statusColor[c.status])}>{statusIcon[c.status]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#e8e8f0] font-medium">{c.name}</p>
                      <p className="text-[11px] text-[#7a7a9a] mt-0.5">{c.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {r.keywords && r.keywords.length > 0 && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Suggested Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {r.keywords.map(k => <span key={k} className="chip text-[11px]">{k}</span>)}
                </div>
              </div>
            )}

            {r.optimizedText && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Optimised Content</p>
                <p className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.optimizedText}</p>
              </div>
            )}
          </div>
        )
      }}
    </ToolShell>
  )
}
