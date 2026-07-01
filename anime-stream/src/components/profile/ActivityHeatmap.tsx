// Heatmap активности по дням (как на GitHub) для последних 90 дней.

import clsx from 'clsx'

interface Item { date: string; count: number }

function intensity(count: number, max: number): string {
  if (count === 0) return 'bg-hover-strong'
  const ratio = count / Math.max(1, max)
  if (ratio < 0.25) return 'bg-neon-purple/30'
  if (ratio < 0.5) return 'bg-neon-purple/55'
  if (ratio < 0.75) return 'bg-neon-pink/65'
  return 'bg-gradient-to-br from-neon-pink to-neon-purple'
}

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function ActivityHeatmap({ items }: { items: Item[] }) {
  const max = items.reduce((m, i) => Math.max(m, i.count), 0)
  const totalEps = items.reduce((s, i) => s + i.count, 0)
  const activeDays = items.filter((i) => i.count > 0).length

  // Группируем по неделям (колонки). Первая дата может быть не понедельником —
  // выравниваем сетку: добавим пустые слоты в начало.
  const weeks: (Item | null)[][] = []
  if (items.length) {
    const first = new Date(items[0].date)
    const firstDow = (first.getDay() + 6) % 7 // Mon=0..Sun=6
    let cur: (Item | null)[] = Array(firstDow).fill(null)
    for (const item of items) {
      cur.push(item)
      if (cur.length === 7) { weeks.push(cur); cur = [] }
    }
    if (cur.length) {
      while (cur.length < 7) cur.push(null)
      weeks.push(cur)
    }
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-semibold flex items-center gap-2">
          🔥 Активность <span className="text-text-dim text-xs font-normal">за последние 90 дней</span>
        </h3>
        <div className="text-xs text-text-muted">
          <span className="text-text font-semibold">{totalEps}</span> серий · активных дней: <span className="text-text font-semibold">{activeDays}</span>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-2">
        <div className="flex gap-1 min-w-fit">
          {/* Дни недели слева */}
          <div className="flex flex-col gap-1 mr-1 pt-0">
            {WEEKDAYS.map((d, i) => (
              <div
                key={d}
                className={clsx(
                  'h-3 text-[9px] text-text-dim leading-3 w-5 text-right',
                  i % 2 === 1 ? 'opacity-100' : 'opacity-0',
                )}
              >
                {d}
              </div>
            ))}
          </div>
          {/* Сетка недель */}
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-3 h-3 rounded-[3px] opacity-0" />
                }
                return (
                  <div
                    key={di}
                    className={clsx(
                      'w-3 h-3 rounded-[3px] transition-transform hover:scale-150 hover:z-10',
                      intensity(day.count, max),
                    )}
                    title={`${day.date}: ${day.count} серий`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-2 mt-3 text-[10px] text-text-dim">
        <span>Меньше</span>
        <div className="w-3 h-3 rounded-[3px] bg-hover-strong" />
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple/30" />
        <div className="w-3 h-3 rounded-[3px] bg-neon-purple/55" />
        <div className="w-3 h-3 rounded-[3px] bg-neon-pink/65" />
        <div className="w-3 h-3 rounded-[3px] bg-gradient-to-br from-neon-pink to-neon-purple" />
        <span>Больше</span>
      </div>
    </div>
  )
}
