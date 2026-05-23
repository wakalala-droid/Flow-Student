// Global in-memory text store — persists across tool tab switches
// Uses a simple module-level singleton so text survives navigation

type TextStore = {
  inputText: string
  setInputText: (text: string) => void
  subscribers: Set<(text: string) => void>
  subscribe: (fn: (text: string) => void) => () => void
}

const store: TextStore = {
  inputText: '',
  subscribers: new Set(),
  setInputText(text: string) {
    this.inputText = text
    this.subscribers.forEach(fn => fn(text))
  },
  subscribe(fn: (text: string) => void) {
    this.subscribers.add(fn)
    return () => this.subscribers.delete(fn)
  },
}

export default store
