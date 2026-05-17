export default function Loading() {
  return (
    <div className="flex h-full overflow-hidden p-5 gap-4">
      <div className="flex-1 card flex flex-col overflow-hidden animate-pulse">
        <div className="px-4 py-3 border-b border-white/[0.07] flex items-center gap-3">
          <div className="skeleton h-3 w-20 rounded" />
        </div>
        <div className="flex-1 p-4 space-y-3">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
          <div className="skeleton h-4 w-4/6 rounded" />
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-3/6 rounded" />
        </div>
      </div>
      <div className="flex-1 card flex flex-col overflow-hidden animate-pulse">
        <div className="px-4 py-3 border-b border-white/[0.07]">
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="skeleton h-8 w-8 rounded-full" />
        </div>
      </div>
      <div className="w-56 flex-shrink-0 space-y-3">
        <div className="card p-3.5 animate-pulse space-y-2">
          <div className="skeleton h-3 w-16 rounded" />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton h-6 w-16 rounded-full" />
            ))}
          </div>
        </div>
        <div className="card p-3.5 animate-pulse space-y-4">
          <div className="skeleton h-3 w-20 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="skeleton h-2.5 w-full rounded" />
              <div className="skeleton h-1 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
