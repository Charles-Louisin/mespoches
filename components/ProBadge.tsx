export default function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide text-amber-900 bg-amber-400 px-1.5 py-0.5 rounded ${className}`}
    >
      Pro
    </span>
  )
}
