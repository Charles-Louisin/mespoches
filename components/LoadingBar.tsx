'use client'

/** Barre indéterminée — pour login / OAuth, pas de skeleton de liste. */
export default function LoadingBar({
  label = 'Chargement…',
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <div
      className={`flex flex-col items-center gap-3 ${className}`}
      role="status"
      aria-label={label}
    >
      <div className="h-1 w-40 overflow-hidden rounded-full bg-ink/10">
        <div className="loading-bar-indeterminate h-full w-1/2 rounded-full bg-primary-600" />
      </div>
      <p className="text-sm text-ink-mute">{label}</p>
    </div>
  )
}
