// components/shared/ToolIcon.tsx
// Clean SVG line icons — 20×20, 1.5px stroke, currentColor, round caps

interface IconProps { size?: number; className?: string }
const I = ({ size = 20, className = '', d, children }: IconProps & { d?: string; children?: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className} aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
)

export const icons: Record<string, (p: IconProps) => JSX.Element> = {

  humanizer: (p) => <I {...p}>
    {/* Person silhouette + sparkle */}
    <circle cx="10" cy="6" r="3" />
    <path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6" />
    <path d="M15 2l.5 1.5L17 4l-1.5.5L15 6l-.5-1.5L13 4l1.5-.5z" strokeWidth="1.2" />
  </I>,

  detector: (p) => <I {...p}>
    {/* Magnifying glass with scan lines */}
    <circle cx="8.5" cy="8.5" r="5" />
    <path d="M12.5 12.5L17 17" />
    <path d="M6 7h5M6 9h3.5" strokeWidth="1.2" />
  </I>,

  plagiarism: (p) => <I {...p}>
    {/* Two overlapping pages + checkmark */}
    <rect x="3" y="5" width="10" height="13" rx="1.5" />
    <path d="M7 2h8a1.5 1.5 0 011.5 1.5V16" />
    <path d="M6 12l2 2 4-4" />
  </I>,

  paraphraser: (p) => <I {...p}>
    {/* Two circular arrows */}
    <path d="M3.5 10A6.5 6.5 0 0110 3.5c2 0 3.8.9 5 2.3" />
    <path d="M16.5 10A6.5 6.5 0 0110 16.5c-2 0-3.8-.9-5-2.3" />
    <path d="M14 3l2.5 2.5-2.5 1.5" />
    <path d="M6 13.5L3.5 16 6 17.5" />
  </I>,

  grammar: (p) => <I {...p}>
    {/* Letter A with underline check */}
    <path d="M4 16l4-12h4l4 12" />
    <path d="M6.5 11h7" />
    <path d="M3 18.5l2.5 2 4-4" strokeWidth="1.3" />
  </I>,

  factcheck: (p) => <I {...p}>
    {/* Document with magnifier + check */}
    <path d="M5 3h8l3 3v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z" />
    <path d="M13 3v4h3" />
    <path d="M7 10h6M7 13h3" />
    <circle cx="14" cy="14.5" r="2.5" />
    <path d="M16 16.5l1.5 1.5" />
  </I>,

  seo: (p) => <I {...p}>
    {/* Bar chart with upward arrow */}
    <path d="M3 16h3v-5H3zM8.5 16h3V8h-3zM14 16h3V4h-3" />
    <path d="M17 4l-4-2-4 3" strokeWidth="1.3" fill="none" />
  </I>,

  tone: (p) => <I {...p}>
    {/* Speech bubble with wave */}
    <path d="M3 4h14a1 1 0 011 1v8a1 1 0 01-1 1H7l-4 3V5a1 1 0 011-1z" />
    <path d="M6 9c1-1.5 3-1.5 4 0s3 1.5 4 0" strokeWidth="1.3" />
  </I>,

  citation: (p) => <I {...p}>
    {/* Open book with quote marks */}
    <path d="M2 4h7v14H2zM11 4h7v14h-7z" rx="0.5" />
    <path d="M9 4v14" />
    <path d="M5 8v1.5c0 1 .7 1.5 1.5 1.5M13.5 8v1.5c0 1 .7 1.5 1.5 1.5" strokeWidth="1.2" />
  </I>,

  summarizer: (p) => <I {...p}>
    {/* Lines compressing into fewer lines */}
    <path d="M3 4h14M3 8h14M3 12h10M3 16h6" />
    <path d="M15 13l2-2 2 2M17 11v5" strokeWidth="1.3" />
  </I>,

  translator: (p) => <I {...p}>
    {/* Globe with text lines */}
    <circle cx="10" cy="10" r="7" />
    <path d="M10 3c-2.5 3-2.5 11 0 14M10 3c2.5 3 2.5 11 0 14M3 10h14" />
  </I>,

  social: (p) => <I {...p}>
    {/* Share / network node icon */}
    <circle cx="16" cy="4"  r="2" />
    <circle cx="4"  cy="10" r="2" />
    <circle cx="16" cy="16" r="2" />
    <path d="M6 9l8-4M6 11l8 4" />
  </I>,

  // Nav extras
  documents: (p) => <I {...p}>
    <path d="M4 4h8l4 4v11a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1z" />
    <path d="M12 4v5h4" />
    <path d="M7 11h6M7 14h4" />
  </I>,

  billing: (p) => <I {...p}>
    <rect x="2" y="5" width="16" height="12" rx="2" />
    <path d="M2 9h16" />
    <path d="M6 13h4" />
  </I>,

  settings: (p) => <I {...p}>
    <circle cx="10" cy="10" r="2.5" />
    <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" strokeWidth="1.5" />
  </I>,

  admin: (p) => <I {...p}>
    <path d="M10 2l7 3v6c0 4-3 7-7 8C7 18 4 15 3 11V5l7-3z" />
    <path d="M7 10l2 2 4-4" />
  </I>,
}

export default function ToolIcon({ toolKey, size = 18, className = '' }: { toolKey: string; size?: number; className?: string }) {
  const Icon = icons[toolKey]
  if (!Icon) return <span className={className} style={{ width: size, height: size, display: 'inline-block' }} />
  return <Icon size={size} className={className} />
}
