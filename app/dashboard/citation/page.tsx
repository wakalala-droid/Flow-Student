'use client'
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const FORMATS = ['APA', 'MLA', 'Chicago', 'Harvard', 'Vancouver', 'IEEE'] as const
type Format = typeof FORMATS[number]

export default function CitationPage() {
  const [selectedFormats, setSelectedFormats] = useState<Format[]>(['APA', 'MLA', 'Chicago', 'Harvard'])

  function toggleFormat(f: Format) {
    setSelectedFormats(prev =>
      prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]
    )
  }

  return (
    <ToolShell
      toolKey="citation"
      outputLabel="Generated Citations"
      placeholder="Paste text that references a source — include author, title, year, journal, URL etc. The AI will extract and format citations automatically…"
      runLabel="Generate Citations"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Formats</p>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map(f => (
                <button key={f} onClick={() => toggleFormat(f)}
                  className={cn('chip text-[10px]', selectedFormats.includes(f) && 'chip-active')}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => state.run({ formats: selectedFormats })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">▶ Generate</button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as {
          citations?: { format: string; citation: string; inText: string }[]
          sourceType?: string
          extractedInfo?: { authors?: string[]; title?: string; year?: string; journal?: string; doi?: string }
        }
        const citations = r.citations ?? []

        async function copyAll() {
          const text = citations.map(c => `[${c.format}]\n${c.citation}`).join('\n\n')
          await navigator.clipboard.writeText(text)
        }

        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="Formats" value={citations.length} color="purple" />
              <ScoreCard label="Source Type" value={r.sourceType ?? '—'} color="blue" />
              <ScoreCard label="Status" value="✓ Ready" color="green" />
            </div>

            {r.extractedInfo && Object.keys(r.extractedInfo).length > 0 && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">Extracted Info</p>
                <div className="space-y-1">
                  {r.extractedInfo.authors && r.extractedInfo.authors.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-[#7a7a9a] w-16 flex-shrink-0">Authors</span>
                      <span className="text-[#e8e8f0]">{r.extractedInfo.authors.join(', ')}</span>
                    </div>
                  )}
                  {r.extractedInfo.title && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-[#7a7a9a] w-16 flex-shrink-0">Title</span>
                      <span className="text-[#e8e8f0]">{r.extractedInfo.title}</span>
                    </div>
                  )}
                  {r.extractedInfo.year && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-[#7a7a9a] w-16 flex-shrink-0">Year</span>
                      <span className="text-[#e8e8f0]">{r.extractedInfo.year}</span>
                    </div>
                  )}
                  {r.extractedInfo.journal && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-[#7a7a9a] w-16 flex-shrink-0">Journal</span>
                      <span className="text-[#e8e8f0]">{r.extractedInfo.journal}</span>
                    </div>
                  )}
                  {r.extractedInfo.doi && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-[#7a7a9a] w-16 flex-shrink-0">DOI</span>
                      <span className="text-blue-400">{r.extractedInfo.doi}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {citations.map((c, i) => (
                <div key={i} className="card p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="badge badge-purple text-[10px]">{c.format}</span>
                    <button
                      onClick={() => navigator.clipboard.writeText(c.citation)}
                      className="btn-ghost text-[10px]">⎘ Copy</button>
                  </div>
                  <p className="text-xs text-[#e8e8f0] leading-relaxed font-mono">{c.citation}</p>
                  {c.inText && (
                    <div className="flex items-center gap-2 pt-1 border-t border-white/[0.05]">
                      <span className="text-[10px] text-[#7a7a9a]">In-text:</span>
                      <span className="text-[11px] text-violet-300 font-mono">{c.inText}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {citations.length > 1 && (
              <button onClick={copyAll} className="btn-secondary w-full justify-center text-xs py-2">
                ⎘ Copy All Citations
              </button>
            )}
          </div>
        )
      }}
    </ToolShell>
  )
}
