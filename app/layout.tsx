import type { Metadata } from 'next'
import { DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Flow-Student — AI Writing Suite',
  description: 'Humanize AI text, detect AI content, fix grammar, check plagiarism, and more. Built for students in Zambia and beyond.',
  keywords: ['AI humanizer', 'plagiarism checker', 'grammar fixer', 'Zambia', 'students'],
  authors: [{ name: 'Flow-Student' }],
  openGraph: {
    title: 'Flow-Student AI Writing Suite',
    description: 'The all-in-one AI writing platform for students.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${dmSans.variable} ${dmMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
