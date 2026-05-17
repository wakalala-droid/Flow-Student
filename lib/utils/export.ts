// Client-side export utilities

export function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadCSV(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(','))
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function formatForExport(tool: string, input: string, output: string, result: Record<string, unknown>): string {
  const lines = [
    `Flow-Student — ${tool.toUpperCase()} Report`,
    `Generated: ${new Date().toLocaleString('en-ZM')}`,
    '',
    '=== INPUT ===',
    input,
    '',
    '=== OUTPUT ===',
    output,
  ]
  if (Object.keys(result).length > 0) {
    lines.push('', '=== ANALYSIS ===', JSON.stringify(result, null, 2))
  }
  return lines.join('\n')
}
