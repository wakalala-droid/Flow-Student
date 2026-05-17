import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="text-center space-y-5">
        <div className="text-6xl font-bold text-[#1c1c28]">404</div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6c63ff] to-violet-400 flex items-center justify-center text-2xl mx-auto">✦</div>
        <h1 className="text-xl font-semibold text-[#e8e8f0]">Page not found</h1>
        <p className="text-sm text-[#7a7a9a] max-w-xs">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/dashboard/humanizer" className="btn-primary text-sm py-2.5 px-5">
            Go to Dashboard
          </Link>
          <Link href="/auth/login" className="btn-secondary text-sm py-2.5 px-5">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
