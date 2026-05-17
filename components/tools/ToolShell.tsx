'use client'
import { useState, useRef } from 'react'
import { cn, countWords, countSentences, readingTime } from '@/lib/utils'

interface ToolShellProps {
  toolKey: string
  inputLabel?: string
  outputLabel?: string
  placeholder?: string
  runLabel?: string
  children: (state: ToolShellState) => React.ReactNode
  sidePanel?: (state: ToolShellState) => React.ReactNode
}

export interface ToolShellState {
  inputText: string
  setInputText: (v: string) => void
  outputText: string
  result: Record<string, unknown>
  isLoading: boolean
  error: string | null
  run: (options?: Record<string, unknown>) => void
  clear: () => void
  wordCount: number
}

export default function ToolShell({
  toolKey, inputLabel = 'Input Text', outputLabel = 'Output',
  placeholder = 'Paste or type your text here…', runLabel = 'Run',
  children, sidePanel,
}: ToolShellProps) {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [result, setResult] = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [optionsCache, setOptionsCache] = useState<Record<string, unknown>>({})
  const outputRef = useRef<HTMLDivElement>(null)

  const wordCount = countWords(inputText)
  const sentences = countSentences(inputText)
  const readTime = readingTime(inputText)

  async function run(options: Record<string, unknown> = {}) {
    if (!inputText.trim() || isLoading) return
    const merged = { ...optionsCache, ...options }
    setOptionsCache(merged)
    setIsLoading(true)
    setError(null)
    setOutputText('')
    setResult({})

    try {
      const res = await fetch(`/api/${toolKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, ...merged }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Processing failed')
      setOutputText(data.outputText || data.rewrittenText || data.correctedText || data.optimizedText || '')
      setResult(data)
      outputRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  function clear() {
    setInputText(''); setOutputText(''); setResult({}); setError(null)
  }

  async function copyOutput() {
    if (outputText) {
      await navigator.clipboard.writeText(outputText)
    }
  }

  const state: ToolShellState = { inputText, setInputText, outputText, result, isLoading, error, run, clear, wordCount }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main editor */}
      <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4 min-w-0">
        {/* Editor row */}
        <div className="flex gap-4 flex-1 min-h-0">
          {/* Input panel */}
          <div className="flex-1 card flex flex-col overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-white/[0.07] flex-shrink-0 gap-3">
              <span className="text-[11px] font-semibold text-[#7a7a9a] uppercase tracking-wider">{inputLabel}</span>
              <div className="ml-auto flex items-center gap-2">
                <span className="badge badge-blue">{wordCount} words</span>
                <button onClick={clear} className="btn-ghost text-[11px]">Clear</button>
              </div>
            </div>
            <textarea
              className="textarea flex-1 p-4"
              placeholder={placeholder}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />
            <div className="px-4 py-2 border-t border-white/[0.07] flex items-center gap-3 text-[11px] text-[#7a7a9a] flex-shrink-0">
              <span>{inputText.length} chars</span>
              <span>·</span>
              <span>{sentences} sentences</span>
              <span>·</span>
              <span>~{readTime} min read</span>
              <button
                onClick={() => run()}
                disabled={isLoading || !inputText.trim()}
                className="ml-auto btn-primary text-xs py-1.5 px-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                    Processing…
                  </span>
                ) : `▶ ${runLabel}`}
              </button>
            </div>
          </div>

          {/* Output panel */}
          <div className="flex-1 card flex flex-col overflow-hidden">
            <div className="flex items-center px-4 py-3 border-b border-white/[0.07] flex-shrink-0 gap-3">
              <span className="text-[11px] font-semibold text-[#7a7a9a] uppercase tracking-wider">{outputLabel}</span>
              <div className="ml-auto flex items-center gap-2">
                {outputText && <button onClick={copyOutput} className="btn-ghost text-[11px]">⎘ Copy</button>}
              </div>
            </div>

            <div ref={outputRef} className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-[#7a7a9a]">
                  <div className="w-8 h-8 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin" />
                  <span className="text-sm">Processing with Groq AI…</span>
                  <span className="text-[11px]">Llama 3.3 70B</span>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-red-400 text-center max-w-xs">{error}</p>
                  <button onClick={() => run()} className="btn-secondary text-xs mt-2">Retry</button>
                </div>
              ) : result && Object.keys(result).length > 0 ? (
                <div className="animate-fade-in">
                  {children(state)}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7a7a9a]">
                  <span className="text-3xl opacity-20">✦</span>
                  <span className="text-sm">Results will appear here</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side panel */}
      {sidePanel && (
        <div className="w-56 flex-shrink-0 border-l border-white/[0.07] overflow-y-auto p-4 space-y-3">
          {sidePanel(state)}
        </div>
      )}
    </div>
  )
}
