'use client'
import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  onTextExtracted: (text: string, filename: string) => void
  className?: string
}

const ACCEPTED = ['.txt', '.md', '.pdf', '.docx']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

export default function FileUpload({ onTextExtracted, className }: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const processFile = useCallback(async (file: File) => {
    if (file.size > MAX_SIZE) { setError('File too large (max 5 MB)'); return }
    setLoading(true); setError('')

    try {
      let text = ''

      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        text = await file.text()
      } else if (file.name.endsWith('.docx')) {
        // Use mammoth via API
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/extract-text', { method: 'POST', body: formData })
        const data = await res.json()
        text = data.text ?? ''
      } else if (file.type === 'application/pdf') {
        const formData = new FormData()
        formData.append('file', file)
        const res = await fetch('/api/extract-text', { method: 'POST', body: formData })
        const data = await res.json()
        text = data.text ?? ''
      } else {
        setError('Unsupported file type. Use .txt, .md, .pdf, or .docx')
        setLoading(false)
        return
      }

      if (!text.trim()) { setError('Could not extract text from file'); setLoading(false); return }
      onTextExtracted(text, file.name)
    } catch {
      setError('Failed to process file. Please try pasting text instead.')
    } finally {
      setLoading(false)
    }
  }, [onTextExtracted])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }, [processFile])

  return (
    <div className={cn('relative', className)}>
      <label
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all text-center',
          dragging
            ? 'border-[#6c63ff] bg-[#6c63ff]/10'
            : 'border-white/[0.1] hover:border-white/[0.2] hover:bg-white/[0.02]'
        )}
      >
        <input
          type="file"
          accept={ACCEPTED.join(',')}
          onChange={onInputChange}
          className="sr-only"
        />
        {loading ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-white/10 border-t-[#6c63ff] rounded-full animate-spin" />
            <span className="text-xs text-[#7a7a9a]">Reading file…</span>
          </div>
        ) : (
          <>
            <span className="text-2xl opacity-40">⬆</span>
            <div>
              <p className="text-xs font-medium text-[#e8e8f0]">Upload a file</p>
              <p className="text-[10px] text-[#7a7a9a] mt-0.5">TXT, MD, PDF, DOCX — max 5 MB</p>
            </div>
          </>
        )}
      </label>
      {error && <p className="text-[11px] text-red-400 mt-1.5">{error}</p>}
    </div>
  )
}
