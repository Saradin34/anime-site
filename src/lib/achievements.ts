// Каталог достижений и движок проверки.
// Условия проверяются на основе lists / history / профиля пользователя.

import type { UserListEntry, HistoryEntry } from '@/types/anime'

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string  // emoji
  /** Цвет градиента бейджа (Tailwind from-X to-Y классы) */
  gradient: string
  /** Редкость: common / rare / epic / legendary */
  tier: 'common' | 'rare' | 'epic' | 'legendary'
  /** Функция проверки (true → разблокировано) */
  check: (ctx: AchievementContext) => boolean
}

export interface AchievementContext {
  lists: UserListEntry[]
  history: HistoryEntry[]
  /** Общее кол-во просмотренных серий (уникальных) */
  totalEpisodesWatched: number
  /** Общее часов просмотра */
  totalHoursWatched: number
  /** Кол-во оценок которые поставил пользователь */
  ratingsCount: number
  /** Кол-во аниме в избранном */
  favoritesCount: number
  /** Кол-во дней с регистрации */
  daysOnSite: number
  /** Часы суток, в которые смотрел (для night-owl и т.п.) */
  watchHours: number[]
}

export const TIER_STYLES: Record<Achievement['tier'], { label: string; ring: string }> = {
  common: { label: 'Обычное', ring: 'ring-text-dim/40' },
  rare: { label: 'Редкое', ring: 'ring-neon-cyan/60' },
  epic: { label: 'Эпическое', ring: 'ring-neon-purple/70' },
  legendary: { label: 'Легендарное', ring: 'ring-neon-pink/80' },
}

export const ACHIEVEMENTS: Achievement[] = [
  // --- Старт ---
  {
    id: 'first_step',
    title: 'Первый шаг',
    description: 'Добавить первое аниме в любой список',
    icon: '🌱',
    gradient: 'from-green-400 to-emerald-600',
    tier: 'common',
    check: ({ lists }) => lists.length >= 1,
  },
  {
    id: 'collector_10',
    title: 'Коллекционер',
    description: 'Иметь 10 аниме в списках',
    icon: '📚',
    gradient: 'from-blue-400 to-cyan-600',
    tier: 'common',
    check: ({ lists }) => lists.length >= 10,
  },
  {
    id: 'collector_50',
    title: 'Библиотекарь',
    description: 'Иметь 50 аниме в списках',
    icon: '📖',
    gradient: 'from-indigo-400 to-purple-600',
    tier: 'rare',
    check: ({ lists }) => lists.length >= 50,
  },
  {
    id: 'collector_100',
    title: 'Архивариус',
    description: 'Иметь 100 аниме в списках',
    icon: '🏛️',
    gradient: 'from-yellow-400 to-orange-600',
    tier: 'epic',
    check: ({ lists }) => lists.length >= 100,
  },

  // --- Просмотр ---
  {
    id: 'first_episode',
    title: 'Премьера',
    description: 'Посмотреть первую серию',
    icon: '🎬',
    gradient: 'from-pink-400 to-rose-600',
    tier: 'common',
    check: ({ history }) => history.length >= 1,
  },
  {
    id: 'binge_watcher',
    title: 'Марафонец',
    description: 'Посмотреть 50 серий',
    icon: '🏃',
    gradient: 'from-orange-400 to-red-600',
    tier: 'rare',
    check: ({ totalEpisodesWatched }) => totalEpisodesWatched >= 50,
  },
  {
    id: 'addicted',
    title: 'Зависимый',
    description: 'Посмотреть 250 серий',
    icon: '⚡',
    gradient: 'from-fuchsia-400 to-pink-600',
    tier: 'epic',
    check: ({ totalEpisodesWatched }) => totalEpisodesWatched >= 250,
  },
  {
    id: 'legend',
    title: 'Легенда',
    description: 'Посмотреть 1000 серий',
    icon: '👑',
    gradient: 'from-yellow-300 via-amber-400 to-orange-600',
    tier: 'legendary',
    check: ({ totalEpisodesWatched }) => totalEpisodesWatched >= 1000,
  },

  // --- Время ---
  {
    id: 'day_in_anime',
    title: 'Сутки в аниме',
    description: 'Накопить 24 часа просмотра',
    icon: '⏰',
    gradient: 'from-cyan-400 to-blue-600',
    tier: 'rare',
    check: ({ totalHoursWatched }) => totalHoursWatched >= 24,
  },
  {
    id: 'week_in_anime',
    title: 'Неделя в аниме',
    description: 'Накопить 168 часов (неделя!) просмотра',
    icon: '📅',
    gradient: 'from-violet-400 to-purple-700',
    tier: 'epic',
    check: ({ totalHoursWatched }) => totalHoursWatched >= 168,
  },

  // --- Особенности ---
  {
    id: 'night_owl',
    title: 'Ночной зритель',
    description: 'Смотреть после полуночи',
    icon: '🦉',
    gradient: 'from-indigo-600 to-purple-900',
    tier: 'common',
    check: ({ watchHours }) => watchHours.some((h) => h >= 0 && h < 5),
  },
  {
    id: 'early_bird',
    title: 'Ранняя пташка',
    description: 'Смотреть до 7 утра',
    icon: '🌅',
    gradient: 'from-amber-300 to-orange-500',
    tier: 'common',
    check: ({ watchHours }) => watchHours.some((h) => h >= 5 && h < 7),
  },
  {
    id: 'critic',
    title: 'Критик',
    description: 'Поставить 10 оценок',
    icon: '⭐',
    gradient: 'from-yellow-400 to-pink-500',
    tier: 'rare',
    check: ({ ratingsCount }) => ratingsCount >= 10,
  },
  {
    id: 'curator',
    title: 'Куратор',
    description: 'Поставить 50 оценок',
    icon: '🎖️',
    gradient: 'from-pink-500 to-purple-700',
    tier: 'epic',
    check: ({ ratingsCount }) => ratingsCount >= 50,
  },
  {
    id: 'hearts_5',
    title: 'Романтик',
    description: 'Добавить 5 аниме в избранное',
    icon: '💕',
    gradient: 'from-rose-400 to-pink-600',
    tier: 'common',
    check: ({ favoritesCount }) => favoritesCount >= 5,
  },
  {
    id: 'completionist',
    title: 'Завершитель',
    description: 'Отметить 20 аниме как «Просмотрено»',
    icon: '✅',
    gradient: 'from-emerald-400 to-green-700',
    tier: 'rare',
    check: ({ lists }) => lists.filter((e) => e.list === 'completed').length >= 20,
  },
  {
    id: 'planner',
    title: 'Планировщик',
    description: '30 аниме в списке «Запланировано»',
    icon: '🗂️',
    gradient: 'from-sky-400 to-indigo-600',
    tier: 'common',
    check: ({ lists }) => lists.filter((e) => e.list === 'planned').length >= 30,
  },
  {
    id: 'veteran',
    title: 'Ветеран',
    description: '30 дней на сайте',
    icon: '🎗️',
    gradient: 'from-purple-500 to-fuchsia-700',
    tier: 'rare',
    check: ({ daysOnSite }) => daysOnSite >= 30,
  },
]

/** Рассчитать контекст из исходных данных */
export function buildContext(
  lists: UserListEntry[],
  history: HistoryEntry[],
  daysOnSite: number,
  avgEpisodeMinutes = 22,
): AchievementContext {
  // Уникальные просмотренные серии
  const seenSet = new Set(history.map((h) => `${h.animeId}-${h.episode}`))
  const totalEpisodesWatched = seenSet.size
  const totalHoursWatched = (totalEpisodesWatched * avgEpisodeMinutes) / 60
  const ratingsCount = lists.filter((e) => (e.rating ?? 0) > 0).length
  const favoritesCount = lists.filter((e) => e.isFavorite).length
  const watchHours = history.map((h) => new Date(h.watchedAt).getHours())
  return {
    lists,
    history,
    totalEpisodesWatched,
    totalHoursWatched,
    ratingsCount,
    favoritesCount,
    daysOnSite,
    watchHours,
  }
}

/** Проверить все достижения и вернуть какие должны быть разблокированы */
export function evaluateAchievements(ctx: AchievementContext): string[] {
  return ACHIEVEMENTS.filter((a) => a.check(ctx)).map((a) => a.id)
}
