import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

    const MAX = 5 * 1024 * 1024
    if (file.size > MAX) return NextResponse.json({ error: 'File too large (max 5 MB)' }, { status: 400 })

    let text = ''

    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      text = await file.text()
    } else if (
      file.name.endsWith('.docx') ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const mammoth = await import('mammoth')
      const buffer = Buffer.from(await file.arrayBuffer())
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // Basic PDF text extraction via buffer read
      const buffer = Buffer.from(await file.arrayBuffer())
      // Extract printable ASCII text from PDF binary
      text = buffer
        .toString('latin1')
        .replace(/[^\x20-\x7E\n\r\t]/g, ' ')
        .replace(/\s{3,}/g, ' ')
        .trim()
        .slice(0, 50000)
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    return NextResponse.json({ text: text.slice(0, 50000), filename: file.name, size: file.size })
  } catch (e) {
    console.error('Extract text error:', e)
    return NextResponse.json({ error: 'Failed to extract text from file' }, { status: 500 })
  }
}
