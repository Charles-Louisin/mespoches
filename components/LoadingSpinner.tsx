'use client'

/** Skeleton de chargement (remplace les spinners circulaires). */
export default function LoadingSpinner({
  rows = 4,
  className = '',
}: {
  rows?: number
  className?: string
}) {
  return (
    <div className={`mx-auto max-w-md space-y-3 px-4 py-6 ${className}`} role="status" aria-label="Chargement">
      <div className="h-28 animate-pulse rounded-xl bg-ink/10" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl bg-surface-card/80 p-3 hairline">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-ink/10" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-ink/[0.07]" />
          </div>
          <div className="h-3 w-14 animate-pulse rounded bg-ink/10" />
        </div>
      ))}
    </div>
  )
}
