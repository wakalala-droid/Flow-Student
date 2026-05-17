// Input sanitization utilities for all API routes

// Strip potential prompt injection attempts
export function sanitizeText(input: string, maxLength = 10000): string {
  if (typeof input !== 'string') return ''

  return input
    .slice(0, maxLength)
    // Remove null bytes
    .replace(/\0/g, '')
    // Collapse excessive whitespace lines
    .replace(/\n{5,}/g, '\n\n')
    .trim()
}

// Sanitize a plain label / short string (plan name, mode, etc.)
export function sanitizeLabel(input: string, maxLength = 64): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[^a-zA-Z0-9 _\-]/g, '').slice(0, maxLength).trim()
}

// Validate a Zambian phone number (9 digits after country code)
export function validateZambianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  // Accept 9 digits (without +260) or 12 digits (with 260)
  if (digits.length === 9) return /^[679]/.test(digits)
  if (digits.length === 12) return digits.startsWith('260') && /^260[679]/.test(digits)
  return false
}

// Normalise phone to 260XXXXXXXXX
export function normalisePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 9) return `260${digits}`
  return digits
}
