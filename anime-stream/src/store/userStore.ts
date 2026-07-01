// Пользовательские данные: списки, история, комментарии, уведомления.
// Хранится в localStorage (привязано к uid).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  UserListEntry, HistoryEntry, Comment, NotificationItem,
  ListType, ListFilter,
} from '@/types/anime'

interface UserState {
  lists: Record<string, UserListEntry[]>
  history: Record<string, HistoryEntry[]>
  comments: Record<number, Comment[]>
  notifications: Record<string, NotificationItem[]>

  // ---- Списки просмотра ----
  /** Установить/изменить статус просмотра. Если уже стоит этот статус — снять. */
  setListStatus: (
    uid: string,
    entry: Pick<UserListEntry, 'animeId' | 'alias' | 'title' | 'poster'>,
    list: ListType,
  ) => void
  /** Полностью убрать запись (и статус, и избранное) */
  removeFromList: (uid: string, animeId: number) => void
  /** Снять только статус просмотра (избранное остаётся) */
  clearListStatus: (uid: string, animeId: number) => void

  // ---- Избранное ----
  /** Переключить флаг избранного (toggle). Если записи нет — создаст. */
  toggleFavorite: (
    uid: string,
    entry: Pick<UserListEntry, 'animeId' | 'alias' | 'title' | 'poster'>,
  ) => void
  isFavorite: (uid: string, animeId: number) => boolean

  // ---- Чтение ----
  setRating: (uid: string, animeId: number, rating: number) => void
  /** Возвращает записи по фильтру: статус, 'favorite' или 'all' */
  getList: (uid: string, filter?: ListFilter) => UserListEntry[]
  /** Текущий статус просмотра аниме (или null) */
  getStatus: (uid: string, animeId: number) => ListType | null

  // ---- История ----
  recordWatch: (uid: string, entry: Omit<HistoryEntry, 'watchedAt'>) => void
  getHistory: (uid: string) => HistoryEntry[]
  clearHistory: (uid: string) => void
  removeHistoryEntry: (uid: string, animeId: number, episode: number) => void

  // ---- Комментарии ----
  addComment: (animeId: number, c: Omit<Comment, 'id' | 'createdAt' | 'likes'>) => void
  removeComment: (animeId: number, commentId: string, userId: string) => void
  toggleLike: (animeId: number, commentId: string, userId: string) => void
  getComments: (animeId: number) => Comment[]

  // ---- Уведомления ----
  /**
   * Добавить уведомление. Дедуплицирует по animeId+episode:
   * если такая нотификация уже есть — обновляет timestamp и сбрасывает read,
   * а не создаёт дубликат.
   */
  pushNotification: (uid: string, n: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void
  markRead: (uid: string, id: string) => void
  markAllRead: (uid: string) => void
  removeNotification: (uid: string, id: string) => void
  clearNotifications: (uid: string) => void
  getNotifications: (uid: string) => NotificationItem[]
  /** Есть ли подписка на этот animeId+episode (для toggle-кнопки) */
  hasNotification: (uid: string, animeId: number, episode: number) => boolean
}

/** Хелпер: вставляет/обновляет запись в lists[uid] без дублей */
function upsertEntry(
  arr: UserListEntry[],
  patch: Partial<UserListEntry> & { animeId: number },
  base: Pick<UserListEntry, 'animeId' | 'alias' | 'title' | 'poster'>,
): UserListEntry[] {
  const idx = arr.findIndex((e) => e.animeId === patch.animeId)
  if (idx >= 0) {
    const next = [...arr]
    next[idx] = { ...next[idx], ...patch, ...base, addedAt: Date.now() }
    // переносим обновлённую запись наверх
    const [item] = next.splice(idx, 1)
    return [item, ...next]
  }
  return [
    {
      alias: base.alias,
      title: base.title,
      poster: base.poster,
      addedAt: Date.now(),
      list: null,
      isFavorite: false,
      ...patch,
      animeId: base.animeId,
    } as UserListEntry,
    ...arr,
  ]
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      lists: {},
      history: {},
      comments: {},
      notifications: {},

      setListStatus: (uid, entry, list) => {
        const all = { ...get().lists }
        const cur = all[uid] || []
        const existing = cur.find((e) => e.animeId === entry.animeId)
        // Toggle: если уже стоит этот статус — снимаем
        if (existing?.list === list) {
          all[uid] = upsertEntry(cur, { animeId: entry.animeId, list: null }, entry)
          // если запись пустая (нет статуса и не в избранном) — удаляем
          const fresh = all[uid].find((e) => e.animeId === entry.animeId)
          if (fresh && !fresh.list && !fresh.isFavorite) {
            all[uid] = all[uid].filter((e) => e.animeId !== entry.animeId)
          }
        } else {
          all[uid] = upsertEntry(cur, { animeId: entry.animeId, list }, entry)
        }
        set({ lists: all })
      },

      removeFromList: (uid, animeId) => {
        const all = { ...get().lists }
        all[uid] = (all[uid] || []).filter((e) => e.animeId !== animeId)
        set({ lists: all })
      },

      clearListStatus: (uid, animeId) => {
        const all = { ...get().lists }
        const cur = all[uid] || []
        const ex = cur.find((e) => e.animeId === animeId)
        if (!ex) return
        if (!ex.isFavorite) {
          // ничего не остаётся — удаляем целиком
          all[uid] = cur.filter((e) => e.animeId !== animeId)
        } else {
          all[uid] = cur.map((e) => e.animeId === animeId ? { ...e, list: null } : e)
        }
        set({ lists: all })
      },

      toggleFavorite: (uid, entry) => {
        const all = { ...get().lists }
        const cur = all[uid] || []
        const existing = cur.find((e) => e.animeId === entry.animeId)
        const nextFav = !existing?.isFavorite
        if (existing) {
          // если снимаем избранное и нет статуса — удалить полностью
          if (!nextFav && !existing.list) {
            all[uid] = cur.filter((e) => e.animeId !== entry.animeId)
          } else {
            all[uid] = upsertEntry(cur, { animeId: entry.animeId, isFavorite: nextFav }, entry)
          }
        } else {
          all[uid] = upsertEntry(cur, { animeId: entry.animeId, isFavorite: true }, entry)
        }
        set({ lists: all })
      },

      isFavorite: (uid, animeId) =>
        !!(get().lists[uid] || []).find((e) => e.animeId === animeId)?.isFavorite,

      setRating: (uid, animeId, rating) => {
        const all = { ...get().lists }
        all[uid] = (all[uid] || []).map((e) =>
          e.animeId === animeId ? { ...e, rating } : e,
        )
        set({ lists: all })
      },

      getList: (uid, filter = 'all') => {
        const items = get().lists[uid] || []
        if (filter === 'all') return items
        if (filter === 'favorite') return items.filter((e) => e.isFavorite)
        return items.filter((e) => e.list === filter)
      },

      getStatus: (uid, animeId) => {
        const item = (get().lists[uid] || []).find((e) => e.animeId === animeId)
        return item?.list || null
      },

      recordWatch: (uid, entry) => {
        const all = { ...get().history }
        const current = (all[uid] || []).filter(
          (e) => !(e.animeId === entry.animeId && e.episode === entry.episode),
        )
        current.unshift({ ...entry, watchedAt: Date.now() })
        all[uid] = current.slice(0, 200)
        set({ history: all })
      },
      getHistory: (uid) => get().history[uid] || [],
      clearHistory: (uid) => {
        const all = { ...get().history }
        delete all[uid]
        set({ history: all })
      },
      removeHistoryEntry: (uid, animeId, episode) => {
        const all = { ...get().history }
        all[uid] = (all[uid] || []).filter(
          (e) => !(e.animeId === animeId && e.episode === episode),
        )
        set({ history: all })
      },

      addComment: (animeId, c) => {
        const all = { ...get().comments }
        const comment: Comment = {
          ...c,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          createdAt: Date.now(),
          likes: [],
        }
        all[animeId] = [comment, ...(all[animeId] || [])]
        set({ comments: all })
      },
      removeComment: (animeId, commentId, userId) => {
        const all = { ...get().comments }
        all[animeId] = (all[animeId] || []).filter(
          (c) => !(c.id === commentId && c.userId === userId),
        )
        set({ comments: all })
      },
      toggleLike: (animeId, commentId, userId) => {
        const all = { ...get().comments }
        all[animeId] = (all[animeId] || []).map((c) => {
          if (c.id !== commentId) return c
          const liked = c.likes.includes(userId)
          return { ...c, likes: liked ? c.likes.filter((u) => u !== userId) : [...c.likes, userId] }
        })
        set({ comments: all })
      },
      getComments: (animeId) => get().comments[animeId] || [],

      pushNotification: (uid, n) => {
        const all = { ...get().notifications }
        const cur = all[uid] || []
        // Дедупликация: ищем существующее уведомление с тем же animeId+episode
        const existingIdx = cur.findIndex(
          (item) => item.animeId === n.animeId && item.episode === n.episode,
        )
        if (existingIdx >= 0) {
          // Обновляем timestamp и сбрасываем "прочитано", переносим наверх
          const updated = {
            ...cur[existingIdx],
            ...n,
            createdAt: Date.now(),
            read: false,
          }
          const next = [updated, ...cur.filter((_, i) => i !== existingIdx)]
          all[uid] = next.slice(0, 50)
        } else {
          const item: NotificationItem = {
            ...n,
            id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            createdAt: Date.now(),
            read: false,
          }
          all[uid] = [item, ...cur].slice(0, 50)
        }
        set({ notifications: all })
      },
      markRead: (uid, id) => {
        const all = { ...get().notifications }
        all[uid] = (all[uid] || []).map((n) => (n.id === id ? { ...n, read: true } : n))
        set({ notifications: all })
      },
      markAllRead: (uid) => {
        const all = { ...get().notifications }
        all[uid] = (all[uid] || []).map((n) => ({ ...n, read: true }))
        set({ notifications: all })
      },
      removeNotification: (uid, id) => {
        const all = { ...get().notifications }
        all[uid] = (all[uid] || []).filter((n) => n.id !== id)
        set({ notifications: all })
      },
      clearNotifications: (uid) => {
        const all = { ...get().notifications }
        all[uid] = []
        set({ notifications: all })
      },
      getNotifications: (uid) => get().notifications[uid] || [],
      hasNotification: (uid, animeId, episode) =>
        (get().notifications[uid] || []).some(
          (n) => n.animeId === animeId && n.episode === episode,
        ),
    }),
    {
      name: 'animeflux:user',
      // v3 — миграция: разделяем "favorite" на отдельный флаг isFavorite
      version: 3,
      migrate: (state: any, version) => {
        if (!state) return state
        // v1 -> v2 (code -> alias)
        if (version < 2) {
          const fix = (arr: any[]) => arr?.map((e: any) => ({ ...e, alias: e.alias || e.code }))
          if (state.lists) for (const k in state.lists) state.lists[k] = fix(state.lists[k])
          if (state.history) for (const k in state.history) state.history[k] = fix(state.history[k])
          if (state.notifications) for (const k in state.notifications) state.notifications[k] = fix(state.notifications[k])
        }
        // v2 -> v3 (list='favorite' → isFavorite=true)
        if (version < 3 && state.lists) {
          for (const uid in state.lists) {
            const byId = new Map<number, UserListEntry>()
            const items: any[] = state.lists[uid] || []
            for (const e of items) {
              const id = e.animeId
              const cur = byId.get(id) || {
                animeId: id,
                alias: e.alias,
                title: e.title,
                poster: e.poster,
                addedAt: e.addedAt || Date.now(),
                list: null,
                isFavorite: false,
                rating: e.rating,
              }
              if (e.list === 'favorite') {
                cur.isFavorite = true
              } else if (e.list) {
                cur.list = e.list
              }
              byId.set(id, cur)
            }
            state.lists[uid] = Array.from(byId.values())
          }
        }
        return state
      },
    },
  ),
)
