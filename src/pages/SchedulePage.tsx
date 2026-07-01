import { useEffect, useState, useMemo } from 'react'
import { Calendar } from 'lucide-react'
import AnimeCard from '@/components/AnimeCard'
import { animeApi } from '@/api/anilibria'
import type { ScheduleItem } from '@/types/anime'
import { useSeo } from '@/hooks/useSeo'
import clsx from 'clsx'

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

export default function SchedulePage() {
  useSeo({
    title: 'Расписание выхода аниме',
    description: 'Когда выходят новые серии аниме-онгоингов. Расписание по дням недели — не пропустите свежий эпизод.',
    canonical: '/schedule',
  })

  const [schedule, setSchedule] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState<number>(() => {
    // publish_day: 1=Пн ... 7=Вс
    const js = new Date().getDay() // 0=Sun ... 6=Sat
    return js === 0 ? 7 : js
  })

  useEffect(() => {
    animeApi.schedule()
      .then(setSchedule)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const itemsByDay = useMemo(() => {
    const map: Record<number, ScheduleItem[]> = {}
    schedule.forEach((s) => {
      const d = s.release.publish_day?.value ?? 0
      if (!map[d]) map[d] = []
      map[d].push(s)
    })
    return map
  }, [schedule])

  const cur = itemsByDay[activeDay] || []

  return (
    <div className="max-w-[1500px] mx-auto px-4 lg:px-8">
      <div className="mb-8 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon-sm">
          <Calendar size={28} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold">Расписание</h1>
          <p className="text-text-muted text-sm">Когда выходят новые серии онгоингов</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-6">
        {DAYS.map((d, i) => {
          const dayValue = i + 1
          const count = (itemsByDay[dayValue] || []).length
          return (
            <button
              key={d}
              onClick={() => setActiveDay(dayValue)}
              className={clsx(
                'shrink-0 px-5 py-3 rounded-xl font-medium transition flex items-center gap-2',
                activeDay === dayValue
                  ? 'bg-gradient-to-r from-neon-pink to-neon-purple text-white shadow-neon-sm'
                  : 'bg-hover border border-app hover:bg-hover-strong text-text-muted'
              )}
            >
              {d}
              {count > 0 && (
                <span className={clsx('text-xs px-1.5 rounded-full', activeDay === dayValue ? 'bg-hover-strong' : 'bg-hover-strong')}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-bg-card rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : cur.length === 0 ? (
        <div className="text-center text-text-muted py-20">В этот день нет новых выпусков</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {cur.map((s) => <AnimeCard key={s.release.id} anime={s.release} />)}
        </div>
      )}
    </div>
  )
}
