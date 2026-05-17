'use client'
import { useState } from 'react'
import { countWords } from '@/lib/utils'

export interface ToolState {
  inputText: string
  outputText: string
  result: Record<string, unknown>
  isLoading: boolean
  error: string | null
  processingTime: number | null
}

export function useTool(toolKey: string) {
  const [state, setState] = useState<ToolState>({
    inputText: '',
    outputText: '',
    result: {},
    isLoading: false,
    error: null,
    processingTime: null,
  })

  function setInput(text: string) {
    setState(s => ({ ...s, inputText: text, error: null }))
  }

  async function run(options: Record<string, unknown> = {}) {
    if (!state.inputText.trim()) return
    const start = Date.now()
    setState(s => ({ ...s, isLoading: true, error: null, outputText: '', result: {} }))

    try {
      const res = await fetch(`/api/${toolKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: state.inputText, ...options }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Something went wrong')
      }

      const data = await res.json()
      setState(s => ({
        ...s,
        isLoading: false,
        outputText: data.outputText || data.humanizedText || data.paraphrasedText || data.correctedText || data.rewrittenText || data.optimizedText || '',
        result: data,
        processingTime: Date.now() - start,
      }))
    } catch (e: unknown) {
      setState(s => ({ ...s, isLoading: false, error: (e as Error).message }))
    }
  }

  function clear() {
    setState({ inputText: '', outputText: '', result: {}, isLoading: false, error: null, processingTime: null })
  }

  const wordCount = countWords(state.inputText)
  const outputWordCount = countWords(state.outputText)

  return { ...state, setInput, run, clear, wordCount, outputWordCount }
}
