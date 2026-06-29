// Donut-диаграмма распределения по жанрам (на чистом SVG, без библиотек).

interface Item { name: string; count: number }

const COLORS = [
  '#ff3df0', '#a855f7', '#22d3ee', '#8b5cf6', '#f59e0b',
  '#10b981', '#ef4444', '#3b82f6', '#ec4899', '#84cc16',
]

export default function GenreDonut({ items }: { items: Item[] }) {
  if (!items.length) {
    return (
      <div className="flex items-center justify-center h-48 text-text-dim text-sm">
        Добавьте аниме в списки, чтобы увидеть статистику
      </div>
    )
  }

  const total = items.reduce((s, i) => s + i.count, 0)
  const size = 200
  const stroke = 28
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const circumference = 2 * Math.PI * r

  let offset = 0
  const segments = items.map((it, idx) => {
    const fraction = it.count / total
    const dash = fraction * circumference
    const seg = {
      color: COLORS[idx % COLORS.length],
      dash,
      offset: -offset,
      name: it.name,
      count: it.count,
      percent: Math.round(fraction * 100),
    }
    offset += dash
    return seg
  })

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg width={size} height={size} className="shrink-0 -rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgb(var(--hover-bg-strong))"
          strokeWidth={stroke}
        />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={stroke}
            strokeDasharray={`${s.dash} ${circumference}`}
            strokeDashoffset={s.offset}
            style={{ transition: 'stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease' }}
          />
        ))}
        <g transform={`rotate(90 ${cx} ${cy})`}>
          <text
            x={cx}
            y={cy - 4}
            textAnchor="middle"
            className="fill-text font-display font-bold"
            style={{ fontSize: 28 }}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 18}
            textAnchor="middle"
            className="fill-text-muted"
            style={{ fontSize: 11 }}
          >
            аниме
          </text>
        </g>
      </svg>

      <ul className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-sm w-full min-w-0">
        {segments.map((s, i) => (
          <li key={i} className="flex items-center gap-2 min-w-0">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ background: s.color }}
            />
            <span className="truncate flex-1">{s.name}</span>
            <span className="text-text-muted text-xs">{s.count}</span>
            <span className="text-text-dim text-xs w-8 text-right">{s.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
