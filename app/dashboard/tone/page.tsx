'use client'
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const TONES = [
  { key: 'Professional', desc: 'Formal, clear, business-ready' },
  { key: 'Academic',     desc: 'Scholarly, structured, precise' },
  { key: 'Casual',       desc: 'Friendly, conversational, natural' },
  { key: 'Creative',     desc: 'Vivid, engaging, expressive' },
  { key: 'Formal',       desc: 'Sophisticated, impersonal, elegant' },
  { key: 'Gen Z',        desc: 'Modern, relatable, punchy' },
  { key: 'Empathetic',   desc: 'Warm, supportive, inclusive' },
] as const

type Tone = typeof TONES[number]['key']

export default function TonePage() {
  const [tone, setTone] = useState<Tone>('Professional')

  return (
    <ToolShell
      toolKey="tone"
      outputLabel="Tone-Rewritten Output"
      placeholder="Paste text to rewrite in a different tone…"
      runLabel="Rewrite Tone"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5 space-y-2">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-1">Target Tone</p>
            {TONES.map(t => (
              <button key={t.key} onClick={() => setTone(t.key)}
                className={cn(
                  'w-full text-left p-2.5 rounded-lg border text-xs transition-all',
                  tone === t.key
                    ? 'border-[#6c63ff]/50 bg-[#6c63ff]/10 text-violet-300'
                    : 'border-white/[0.07] bg-[#16161f] text-[#7a7a9a] hover:border-white/[0.12] hover:text-[#e8e8f0]'
                )}>
                <div className="font-semibold">{t.key}</div>
                <div className="text-[10px] opacity-70 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => state.run({ tone })} disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">▶ Rewrite</button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { rewrittenText?: string; toneApplied?: string }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCard label="Tone Applied" value={r.toneApplied ?? tone} color="purple" />
              <ScoreCard label="Status" value="✓ Applied" color="green" />
            </div>
            <p className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.rewrittenText}</p>
          </div>
        )
      }}
    </ToolShell>
  )
}
