'use client'
import { useState, useEffect } from 'react'
import store from '@/lib/utils/textStore'

// Syncs component state with the global text store
// Text persists when switching between tool tabs
export function useTextMemory() {
  const [inputText, setLocalText] = useState(store.inputText)

  useEffect(() => {
    // Sync with store on mount
    setLocalText(store.inputText)
    // Subscribe to external changes
    const unsub = store.subscribe(text => setLocalText(text))
    return unsub
  }, [])

  function setInputText(text: string) {
    setLocalText(text)
    store.setInputText(text)
  }

  function clearText() {
    setLocalText('')
    store.setInputText('')
  }

  return { inputText, setInputText, clearText }
}
