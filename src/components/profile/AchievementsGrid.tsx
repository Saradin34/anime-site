// Сетка всех достижений: разблокированные подсвечены, заблокированные — серые.

import clsx from 'clsx'
import { Lock } from 'lucide-react'
import { ACHIEVEMENTS, TIER_STYLES, type Achievement } from '@/lib/achievements'
import type { UnlockedAchievement } from '@/types/anime'

interface Props {
  unlocked: UnlockedAchievement[]
  /** Показывать только разблокированные */
  onlyUnlocked?: boolean
  /** Лимит на количество показа (для preview на профиле) */
  limit?: number
}

export default function AchievementsGrid({ unlocked, onlyUnlocked, limit }: Props) {
  const unlockedMap = new Map(unlocked.map((u) => [u.id, u]))
  let list: Achievement[] = ACHIEVEMENTS
  if (onlyUnlocked) list = list.filter((a) => unlockedMap.has(a.id))
  if (limit) list = list.slice(0, limit)

  if (list.length === 0) {
    return (
      <div className="glass rounded-2xl p-8 text-center text-text-muted">
        <span className="text-4xl block mb-2">🏆</span>
        <p className="text-sm">Пока нет достижений</p>
        <p className="text-xs text-text-dim mt-1">Смотрите аниме, ставьте оценки — и они появятся!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {list.map((a) => {
        const isOpen = unlockedMap.has(a.id)
        const tier = TIER_STYLES[a.tier]
        return (
          <div
            key={a.id}
            className={clsx(
              'group relative rounded-2xl p-4 border border-app transition',
              isOpen
                ? 'bg-bg-card hover:scale-[1.03] hover:-translate-y-0.5 cursor-default'
                : 'bg-hover opacity-60 hover:opacity-90',
            )}
            title={isOpen
              ? `${a.title}: ${a.description}\nОткрыто: ${new Date(unlockedMap.get(a.id)!.unlockedAt).toLocaleDateString('ru-RU')}`
              : `${a.title}: ${a.description}`}
          >
            <div
              className={clsx(
                'w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center text-2xl ring-2',
                isOpen ? `bg-gradient-to-br ${a.gradient} ${tier.ring} shadow-neon-sm` : 'bg-hover-strong ring-text-dim/20 grayscale',
              )}
            >
              {isOpen ? a.icon : <Lock size={20} className="text-text-dim" />}
            </div>
            <h4 className={clsx('text-sm font-semibold text-center line-clamp-1', !isOpen && 'text-text-muted')}>
              {a.title}
            </h4>
            <p className="text-[11px] text-text-dim text-center line-clamp-2 mt-1 min-h-[28px]">
              {a.description}
            </p>
            <div className="mt-2 flex items-center justify-center">
              <span
                className={clsx(
                  'text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold',
                  a.tier === 'common' && 'bg-hover-strong text-text-muted',
                  a.tier === 'rare' && 'bg-neon-cyan/15 text-neon-cyan',
                  a.tier === 'epic' && 'bg-neon-purple/15 text-neon-purple',
                  a.tier === 'legendary' && 'bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 text-neon-pink',
                )}
              >
                {tier.label}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
