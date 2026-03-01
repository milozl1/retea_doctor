export default function Loading() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/[0.04] animate-pulse" />
          <div className="space-y-2">
            <div className="h-5 w-40 bg-white/[0.05] rounded-md animate-pulse" />
            <div className="h-3 w-24 bg-white/[0.03] rounded-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Sort tabs skeleton */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-20 bg-white/[0.03] rounded-lg animate-pulse" />
        ))}
      </div>

      {/* Post skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="glass-card p-5">
          <div className="flex gap-3">
            <div className="w-10 h-16 bg-white/[0.03] rounded-lg animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="flex gap-2">
                <div className="h-4 bg-white/[0.04] rounded-md w-16 animate-pulse" />
                <div className="h-4 bg-white/[0.03] rounded-md w-24 animate-pulse" />
              </div>
              <div className="h-5 bg-white/[0.05] rounded-md w-4/5 animate-pulse" />
              <div className="h-3 bg-white/[0.03] rounded-md w-full animate-pulse" />
              <div className="h-3 bg-white/[0.02] rounded-md w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
