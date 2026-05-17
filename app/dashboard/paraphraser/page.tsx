'use client'
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const MODES = ['Fluency','Academic','Creative','Concise','Expand','Simplify','Professional','SEO'] as const
type Mode = typeof MODES[number]

export default function ParaphraserPage() {
  const [mode, setMode] = useState<Mode>('Fluency')
  const [intensity, setIntensity] = useState(70)

  return (
    <ToolShell
      toolKey="paraphrase"
      outputLabel="Paraphrased Output"
      placeholder="Paste text to paraphrase…"
      runLabel="Paraphrase"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Mode</p>
            <div className="flex flex-wrap gap-1.5">
              {MODES.map(m => (
                <button key={m} onClick={() => setMode(m)} className={cn('chip text-[10px]', mode === m && 'chip-active')}>{m}</button>
              ))}
            </div>
          </div>
          <div className="card p-3.5">
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="text-[#7a7a9a]">Intensity</span>
              <span className="text-violet-400 font-semibold">{intensity}%</span>
            </div>
            <input type="range" min={1} max={100} value={intensity} onChange={e => setIntensity(Number(e.target.value))}
              className="w-full h-1 bg-[#1c1c28] rounded-full appearance-none cursor-pointer accent-[#6c63ff]" />
          </div>
          <button onClick={() => state.run({ mode, intensity })} disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">▶ Paraphrase</button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { paraphrasedText?: string; wordsOriginal?: number; wordsNew?: number; changePercent?: number }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="Original Words" value={r.wordsOriginal ?? 0} color="blue" />
              <ScoreCard label="New Words" value={r.wordsNew ?? 0} color="purple" />
              <ScoreCard label="Change" value={`${r.changePercent ?? 0}%`} color="green" />
            </div>
            <div className="flex gap-1.5">
              <span className="badge badge-purple">Mode: {mode}</span>
              <span className="badge badge-blue">Intensity: {intensity}%</span>
            </div>
            <p className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.paraphrasedText}</p>
          </div>
        )
      }}
    </ToolShell>
  )
}
