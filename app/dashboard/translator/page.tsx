'use client'
// app/dashboard/translator/page.tsx
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const LANGUAGES = ['French','Spanish','Portuguese','German','Italian','Mandarin','Arabic','Swahili','Zulu','Bemba','Nyanja','Tonga','Luvale','Hindi','Japanese','Korean','Russian','Dutch']
const TONES = ['formal','neutral','casual'] as const

export default function TranslatorPage() {
  const [lang, setLang] = useState('French')
  const [tone, setTone] = useState<typeof TONES[number]>('neutral')

  return (
    <ToolShell
      toolKey="translate"
      outputLabel="Translation"
      placeholder="Paste text to translate…"
      runLabel="Translate"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Target Language</p>
            <select value={lang} onChange={e => setLang(e.target.value)} className="input w-full text-xs py-1.5">
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Tone</p>
            <div className="flex gap-1.5">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={cn('chip text-[10px] capitalize flex-1', tone === t && 'chip-active')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => state.run({ targetLanguage: lang, tone })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2">
            ▶ Translate
          </button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { translatedText?: string; detectedLanguage?: string; targetLanguage?: string; confidence?: number }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <ScoreCard label="Detected"   value={r.detectedLanguage ?? '—'} color="blue"   />
              <ScoreCard label="Translated" value={r.targetLanguage  ?? lang} color="purple" />
              <ScoreCard label="Confidence" value={`${r.confidence ?? 0}%`}   color="green" progress={r.confidence}  />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              <span className="badge badge-green">✓ Translated</span>
              <span className="badge badge-blue capitalize">{tone} tone</span>
            </div>
            <div className="text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.translatedText}</div>
          </div>
        )
      }}
    </ToolShell>
  )
}
