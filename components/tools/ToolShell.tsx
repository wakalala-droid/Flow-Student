'use client'
import { useState, useRef } from 'react'
import { cn, countWords, countSentences, readingTime } from '@/lib/utils'
import { useTextMemory } from '@/hooks/useTextMemory'
import FileUpload from './FileUpload'
import AILoader from '@/components/shared/AILoader'

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
  toolKey, inputLabel = 'Input', outputLabel = 'Output',
  placeholder = 'Paste or type your text here…', runLabel = 'Run',
  children, sidePanel,
}: ToolShellProps) {
  // Global text memory — persists across tool tab switches
  const { inputText, setInputText, clearText } = useTextMemory()

  const [outputText, setOutputText] = useState('')
  const [result, setResult]         = useState<Record<string, unknown>>({})
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [optionsCache, setOptionsCache] = useState<Record<string, unknown>>({})
  const [showUpload, setShowUpload] = useState(false)
  const [activeTab, setActiveTab]   = useState<'input' | 'output'>('input')
  const outputRef = useRef<HTMLDivElement>(null)

  const wordCount = countWords(inputText)
  const sentences = countSentences(inputText)
  const readTime  = readingTime(inputText)

  async function run(options: Record<string, unknown> = {}) {
    if (!inputText.trim() || isLoading) return
    const merged = { ...optionsCache, ...options }
    setOptionsCache(merged)
    setIsLoading(true)
    setError(null)
    setOutputText('')
    setResult({})
    setActiveTab('output')

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
    clearText()
    setOutputText('')
    setResult({})
    setError(null)
    setActiveTab('input')
  }

  async function copyOutput() {
    if (outputText) await navigator.clipboard.writeText(outputText)
  }

  const state: ToolShellState = { inputText, setInputText, outputText, result, isLoading, error, run, clear, wordCount }

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Mobile tabs */}
        <div className="lg:hidden flex border-b border-white/[0.07] flex-shrink-0">
          {(['input', 'output'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-3 text-xs font-semibold capitalize transition-colors',
                activeTab === tab ? 'text-violet-300 border-b-2 border-violet-400' : 'text-[#7a7a9a]'
              )}>
              {tab === 'input' ? `✏ ${inputLabel}` : `✦ ${outputLabel}`}
            </button>
          ))}
        </div>

        <div className="flex-1 flex overflow-hidden p-3 lg:p-5 gap-3 lg:gap-4">

          {/* Input panel */}
          <div className={cn(
            'flex flex-col overflow-hidden card',
            'lg:flex-1',
            activeTab === 'input' ? 'flex flex-1' : 'hidden lg:flex lg:flex-1'
          )}>
            <div className="flex items-center px-3 lg:px-4 py-2.5 border-b border-white/[0.07] flex-shrink-0 gap-2">
              <span className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider hidden lg:block">{inputLabel}</span>
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="badge badge-blue text-[10px]">{wordCount}w</span>
                {inputText && (
                  <span className="text-[10px] text-emerald-400 font-medium">● Saved</span>
                )}
                <button onClick={() => setShowUpload(v => !v)} className="btn-ghost text-[10px] py-1 px-2">⬆</button>
                <button onClick={clear} className="btn-ghost text-[10px] py-1 px-2">Clear</button>
              </div>
            </div>

            {showUpload && (
              <div className="p-3 border-b border-white/[0.07]">
                <FileUpload onTextExtracted={(text) => { setInputText(text); setShowUpload(false) }} />
              </div>
            )}

            <textarea
              className="textarea flex-1 p-3 lg:p-4"
              placeholder={placeholder}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
            />

            <div className="px-3 lg:px-4 py-2 border-t border-white/[0.07] flex items-center gap-2 flex-shrink-0">
              <span className="text-[10px] text-[#7a7a9a] hidden sm:block">{sentences}s · ~{readTime}m</span>
              <button onClick={() => run()} disabled={isLoading || !inputText.trim()}
                className="ml-auto btn-primary text-xs py-2 px-4 min-h-[36px]">
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
          <div className={cn(
            'flex flex-col overflow-hidden card',
            'lg:flex-1',
            activeTab === 'output' ? 'flex flex-1' : 'hidden lg:flex lg:flex-1'
          )}>
            <div className="flex items-center px-3 lg:px-4 py-2.5 border-b border-white/[0.07] flex-shrink-0 gap-2">
              <span className="text-[10px] font-semibold text-[#7a7a9a] uppercase tracking-wider hidden lg:block">{outputLabel}</span>
              {outputText && (
                <button onClick={copyOutput} className="btn-ghost text-[10px] py-1 px-2 ml-auto">⎘ Copy</button>
              )}
            </div>

            <div ref={outputRef} className="flex-1 overflow-y-auto p-3 lg:p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <AILoader />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <span className="text-2xl">⚠️</span>
                  <p className="text-sm text-red-400 text-center max-w-xs">{error}</p>
                  <button onClick={() => run()} className="btn-secondary text-xs mt-2">Retry</button>
                </div>
              ) : result && Object.keys(result).length > 0 ? (
                <div className="animate-fade-in">{children(state)}</div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-[#7a7a9a]">
                  <span className="text-3xl opacity-20">✦</span>
                  <span className="text-sm text-center">Results appear here</span>
                  <span className="text-xs text-center opacity-60">Enter text and tap Run</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Side panel — desktop only */}
      {sidePanel && (
        <div className="hidden lg:flex w-56 flex-shrink-0 border-l border-white/[0.07] overflow-y-auto p-4 flex-col gap-3">
          {sidePanel(state)}
        </div>
      )}
    </div>
  )
}
