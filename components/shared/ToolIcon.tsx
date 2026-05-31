// components/shared/ToolIcon.tsx
// Redesigned to match reference UI — 20×20, 1.5px stroke, currentColor

interface P { size?: number; className?: string }

const Svg = ({ size=20, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {children}
  </svg>
)

export const icons: Record<string,(p:P)=>JSX.Element> = {

  // 4-pointed sparkle star — matches AI Humanizer in reference
  humanizer: ({size=20})=><svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M10 2L11.8 8.2L18 10L11.8 11.8L10 18L8.2 11.8L2 10L8.2 8.2Z"
      stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M15 3L15.6 4.4L17 5L15.6 5.6L15 7L14.4 5.6L13 5L14.4 4.4Z"
      stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>,

  // Magnifying glass + AI lines
  detector: ({size=20})=><Svg size={size}>
    <circle cx="8.5" cy="8.5" r="5.5"/>
    <path d="M12.5 12.5L17 17"/>
    <path d="M6 7.5h5M6 9.5h3" strokeWidth="1.3"/>
  </Svg>,

  // Two pages stacked
  plagiarism: ({size=20})=><Svg size={size}>
    <path d="M13 3H7a1 1 0 00-1 1v11a1 1 0 001 1h8a1 1 0 001-1V7l-3-4z"/>
    <path d="M13 3v4h3"/>
    <path d="M5 6H4a1 1 0 00-1 1v10a1 1 0 001 1h7"/>
    <path d="M8 11h4M8 13.5h3"/>
  </Svg>,

  // Circular arrows
  paraphraser: ({size=20})=><Svg size={size}>
    <path d="M3.5 10.5A6.5 6.5 0 0110 4c2 0 3.7.9 4.9 2.2"/>
    <path d="M16.5 9.5A6.5 6.5 0 0110 16c-2 0-3.7-.9-4.9-2.2"/>
    <path d="M14 2.5l1.5 3.5-3.5.5"/>
    <path d="M6 13.5l-1.5 3 3.5.5"/>
  </Svg>,

  // Three wavy lines — matches Grammar Flow in reference exactly
  grammar: ({size=20})=><svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path d="M3 6.5 Q5.5 4.5 8 6.5 T13 6.5 T17 6.5"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M3 10 Q5.5 8 8 10 T13 10 T17 10"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
    <path d="M3 13.5 Q5.5 11.5 8 13.5 T13 13.5 T17 13.5"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none"/>
  </svg>,

  // Shield with checkmark — matches Fact Check in reference
  factcheck: ({size=20})=><Svg size={size}>
    <path d="M10 2L4 5v5c0 3.5 2.5 6.7 6 7.5C14.5 16.7 17 13.5 17 10V5L10 2z"/>
    <path d="M7 10l2 2 4-4" strokeWidth="1.5"/>
  </Svg>,

  // Bar chart rising
  seo: ({size=20})=><Svg size={size}>
    <path d="M3 17V12h3v5H3zM8.5 17V8h3v9h-3zM14 17V4h3v13h-3"/>
    <path d="M3 12l4-4 3 3 5-5.5" strokeWidth="1.3"/>
  </Svg>,

  // Speech bubble with waveform
  tone: ({size=20})=><Svg size={size}>
    <path d="M3 4.5h14a1 1 0 011 1V13a1 1 0 01-1 1H7l-4 3V5.5a1 1 0 011-1z"/>
    <path d="M6 9.5q1.5-2 3 0t3 0" strokeWidth="1.3"/>
  </Svg>,

  // Opening double quotation marks — matches Citations in reference
  citation: ({size=20})=><svg width={size} height={size} viewBox="0 0 20 20" fill="currentColor">
    <path d="M4 13.5c0-2.5 1.2-4.8 3.5-6.5L9 8.5C7.5 9.8 6.8 11 6.8 12.2c.4-.1.8-.2 1.2-.2 1.1 0 2 .9 2 2s-.9 2-2 2C6 16 4 15 4 13.5z" opacity="0.9"/>
    <path d="M11 13.5c0-2.5 1.2-4.8 3.5-6.5L16 8.5C14.5 9.8 13.8 11 13.8 12.2c.4-.1.8-.2 1.2-.2 1.1 0 2 .9 2 2s-.9 2-2 2C13 16 11 15 11 13.5z" opacity="0.9"/>
  </svg>,

  // Lines collapsing
  summarizer: ({size=20})=><Svg size={size}>
    <path d="M3 5h14M3 8.5h14M3 12h10M3 15.5h7"/>
    <path d="M15.5 12l2.5 2-2.5 2" strokeWidth="1.3"/>
  </Svg>,

  // Globe
  translator: ({size=20})=><Svg size={size}>
    <circle cx="10" cy="10" r="7.5"/>
    <path d="M10 2.5c-2.5 3-2.5 12 0 15M10 2.5c2.5 3 2.5 12 0 15M2.5 10h15"/>
    <path d="M3.5 7h13M3.5 13h13" strokeWidth="1.2"/>
  </Svg>,

  // Network share nodes
  social: ({size=20})=><Svg size={size}>
    <circle cx="15.5" cy="4.5" r="2"/>
    <circle cx="4.5"  cy="10" r="2"/>
    <circle cx="15.5" cy="15.5" r="2"/>
    <path d="M6.4 9l7.2-3.6M6.4 11l7.2 3.6"/>
  </Svg>,

  // Document
  documents: ({size=20})=><Svg size={size}>
    <path d="M5 3h8l3.5 3.5V18a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z"/>
    <path d="M13 3v4.5h3.5"/>
    <path d="M7 11h6M7 14h4" strokeWidth="1.3"/>
  </Svg>,

  // Credit card
  billing: ({size=20})=><Svg size={size}>
    <rect x="2" y="5" width="16" height="12" rx="2"/>
    <path d="M2 9h16"/>
    <path d="M6 13.5h3" strokeWidth="2"/>
  </Svg>,

  // Gear
  settings: ({size=20})=><Svg size={size}>
    <circle cx="10" cy="10" r="2.8"/>
    <path d="M10 2.5v1.8M10 15.7v1.8M2.5 10h1.8M15.7 10h1.8M4.6 4.6l1.3 1.3M14.1 14.1l1.3 1.3M4.6 15.4l1.3-1.3M14.1 5.9l1.3-1.3"/>
  </Svg>,

  // Shield
  admin: ({size=20})=><Svg size={size}>
    <path d="M10 2l7.5 3v5c0 4-3 7.5-7.5 8.5C5.5 17.5 2.5 14 2.5 10V5L10 2z"/>
    <path d="M7 10l2 2 4-4"/>
  </Svg>,
}

export default function ToolIcon({ toolKey, size=18, className='' }:{ toolKey:string; size?:number; className?:string }) {
  const Icon = icons[toolKey]
  if (!Icon) return <span style={{ width:size, height:size, display:'inline-block' }} className={className}/>
  return <span className={className} style={{ display:'inline-flex', alignItems:'center', justifyContent:'center' }}>
    <Icon size={size}/>
  </span>
}
