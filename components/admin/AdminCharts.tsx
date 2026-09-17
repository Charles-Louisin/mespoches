'use client'

export function LineChart({
  data,
  keys,
  colors,
  height = 180,
}: {
  data: { date: string; [k: string]: number | string }[]
  keys: string[]
  colors: string[]
  height?: number
}) {
  const w = 640
  const h = height
  const pad = { l: 8, r: 8, t: 12, b: 22 }
  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b
  const max = Math.max(
    1,
    ...data.flatMap((d) => keys.map((k) => Number(d[k] || 0)))
  )
  const step = data.length > 1 ? innerW / (data.length - 1) : innerW

  const path = (key: string) =>
    data
      .map((d, i) => {
        const x = pad.l + i * step
        const y = pad.t + innerH - (Number(d[key] || 0) / max) * innerH
        return `${i === 0 ? 'M' : 'L'}${x},${y}`
      })
      .join(' ')

  const area = (key: string) => {
    if (!data.length) return ''
    const line = path(key)
    const lastX = pad.l + (data.length - 1) * step
    return `${line} L${lastX},${pad.t + innerH} L${pad.l},${pad.t + innerH} Z`
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" role="img">
      {keys.map((key, i) => (
        <g key={key}>
          <path d={area(key)} fill={colors[i]} opacity={0.14} />
          <path d={path(key)} fill="none" stroke={colors[i]} strokeWidth={2.4} strokeLinejoin="round" />
        </g>
      ))}
      {data.length > 1 ? (
        <text x={pad.l} y={h - 4} className="fill-[#8a829c]" fontSize="10">
          {String(data[0].date).slice(5)}
        </text>
      ) : null}
      {data.length > 1 ? (
        <text x={w - pad.r} y={h - 4} textAnchor="end" className="fill-[#8a829c]" fontSize="10">
          {String(data[data.length - 1].date).slice(5)}
        </text>
      ) : null}
    </svg>
  )
}

export function BarList({
  items,
  color = '#2563eb',
  onPick,
}: {
  items: { label: string; value: number }[]
  color?: string
  onPick?: (label: string) => void
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (!items.length) return <p className="text-sm text-[#8a829c]">Pas encore de données.</p>
  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const inner = (
          <>
            <div className="mb-1 flex justify-between text-[12px]">
              <span className="truncate text-[#3f3358]">{item.label || '—'}</span>
              <span className="font-semibold text-[#111]">{item.value}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-[#ece8f5]">
              <div
                className="h-full rounded-full"
                style={{ width: `${(item.value / max) * 100}%`, background: color }}
              />
            </div>
          </>
        )
        if (!onPick) return <div key={item.label}>{inner}</div>
        return (
          <button type="button" key={item.label} className="ad-hit-bar w-full text-left" onClick={() => onPick(item.label)}>
            {inner}
          </button>
        )
      })}
    </div>
  )
}

export function Donut({
  slices,
}: {
  slices: { label: string; value: number; color: string }[]
}) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1
  let acc = 0
  const r = 36
  const c = 2 * Math.PI * r
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 100 100" className="h-28 w-28 -rotate-90">
        {slices.map((slice) => {
          const len = (slice.value / total) * c
          const dash = `${len} ${c - len}`
          const offset = -acc
          acc += len
          return (
            <circle
              key={slice.label}
              cx="50"
              cy="50"
              r={r}
              fill="none"
              stroke={slice.color}
              strokeWidth="14"
              strokeDasharray={dash}
              strokeDashoffset={offset}
            />
          )
        })}
      </svg>
      <ul className="space-y-1.5 text-[12px]">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-[#3f3358]">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.label}
            <b className="text-[#111]">{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  )
}
