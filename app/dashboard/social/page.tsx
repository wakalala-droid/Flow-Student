'use client'
// app/dashboard/social/page.tsx
import { useState } from 'react'
import ToolShell from '@/components/tools/ToolShell'
import ScoreCard from '@/components/shared/ScoreCard'
import { cn } from '@/lib/utils'

const PLATFORMS = ['Twitter/X','LinkedIn','Instagram','Facebook','TikTok'] as const
const TONES     = ['Professional','Casual','Funny','Inspirational','Educational'] as const

export default function SocialPage() {
  const [platform,        setPlatform]        = useState<typeof PLATFORMS[number]>('LinkedIn')
  const [tone,            setTone]            = useState<typeof TONES[number]>('Professional')
  const [includeHashtags, setIncludeHashtags] = useState(true)
  const [includeEmoji,    setIncludeEmoji]    = useState(true)

  return (
    <ToolShell
      toolKey="social"
      outputLabel="Generated Post"
      placeholder="Describe what your post is about… (e.g. 'tips for studying at university', 'launching my new business')"
      runLabel="Write Post"
      sidePanel={(state) => (
        <>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Platform</p>
            <div className="flex flex-wrap gap-1.5">
              {PLATFORMS.map(p => (
                <button key={p} onClick={() => setPlatform(p)}
                  className={cn('chip text-[10px]', platform === p && 'chip-active')}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-3.5">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2.5">Tone</p>
            <div className="flex flex-wrap gap-1.5">
              {TONES.map(t => (
                <button key={t} onClick={() => setTone(t)}
                  className={cn('chip text-[10px]', tone === t && 'chip-active')}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="card p-3.5 space-y-2">
            <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider">Options</p>
            {[['Include Hashtags', includeHashtags, setIncludeHashtags], ['Include Emoji', includeEmoji, setIncludeEmoji]].map(([label, val, set]) => (
              <button key={label as string} onClick={() => (set as (v: boolean) => void)(!val as boolean)}
                className="flex items-center gap-2 text-xs text-[#7a7a9a] hover:text-[#e8e8f0] w-full">
                <span className={cn('w-4 h-4 rounded border flex items-center justify-center text-[10px] transition-all',
                  val ? 'bg-[#6c63ff] border-[#6c63ff] text-white' : 'border-white/20')}>
                  {val ? '✓' : ''}
                </span>
                {label as string}
              </button>
            ))}
          </div>
          <button
            onClick={() => state.run({ platform, tone, includeHashtags, includeEmoji })}
            disabled={state.isLoading || !state.inputText.trim()}
            className="btn-primary w-full justify-center text-xs py-2 hidden lg:flex">
            ▶ Write Post
          </button>
        </>
      )}
    >
      {(state) => {
        const r = state.result as { post?: string; hashtags?: string[]; characterCount?: number; suggestions?: string[] }
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <ScoreCard label="Platform"   value={platform}                color="purple" />
              <ScoreCard label="Characters" value={r.characterCount ?? 0}  color="blue"   />
            </div>
            {r.hashtags && r.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {r.hashtags.map((h, i) => (
                  <span key={i} className="badge badge-blue">#{h}</span>
                ))}
              </div>
            )}
            <div className="card p-4 text-sm text-[#e8e8f0] leading-relaxed whitespace-pre-wrap">{r.post}</div>
            {r.suggestions && (
              <div className="card p-3.5">
                <p className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider mb-2">💡 Tips</p>
                <ul className="space-y-1">
                  {r.suggestions.map((s, i) => <li key={i} className="text-xs text-[#7a7a9a]">• {s}</li>)}
                </ul>
              </div>
            )}
          </div>
        )
      }}
    </ToolShell>
  )
}
