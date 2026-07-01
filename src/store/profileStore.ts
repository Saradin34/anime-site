// Хранилище профиля пользователя: аватар, обложка, био, соц.ссылки,
// витрина любимых, разблокированные достижения.
// Хранится в localStorage по uid.

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile, UnlockedAchievement, SocialLinks } from '@/types/anime'

interface ProfileState {
  profiles: Record<string, UserProfile>
  achievements: Record<string, UnlockedAchievement[]>

  getProfile: (uid: string) => UserProfile
  updateProfile: (uid: string, patch: Partial<UserProfile>) => void
  setAvatar: (uid: string, dataUrl: string | null) => void
  setCover: (uid: string, dataUrl: string | null) => void
  setBio: (uid: string, bio: string) => void
  setQuote: (uid: string, quote: string) => void
  setDisplayName: (uid: string, name: string) => void
  setSocial: (uid: string, social: SocialLinks) => void
  setFavoriteGenres: (uid: string, ids: number[]) => void
  toggleShowcase: (uid: string, animeId: number) => void
  resetProfile: (uid: string) => void

  unlockAchievement: (uid: string, achievementId: string) => boolean
  getUnlocked: (uid: string) => UnlockedAchievement[]
  isUnlocked: (uid: string, achievementId: string) => boolean
}

const EMPTY_PROFILE: UserProfile = {
  avatar: null,
  cover: null,
  displayName: null,
  bio: '',
  quote: '',
  favoriteGenres: [],
  showcaseAnimeIds: [],
  social: {},
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: {},
      achievements: {},

      getProfile: (uid) => {
        const p = get().profiles[uid]
        if (p) return p
        // Возвращаем "вид" пустого профиля. Запишется в store только при первом updateProfile.
        return { ...EMPTY_PROFILE, joinedAt: Date.now() }
      },

      updateProfile: (uid, patch) => {
        const all = { ...get().profiles }
        const cur = all[uid] || { ...EMPTY_PROFILE, joinedAt: Date.now() }
        all[uid] = { ...cur, ...patch, updatedAt: Date.now() }
        set({ profiles: all })
      },

      setAvatar: (uid, dataUrl) => get().updateProfile(uid, { avatar: dataUrl }),
      setCover: (uid, dataUrl) => get().updateProfile(uid, { cover: dataUrl }),
      setBio: (uid, bio) => get().updateProfile(uid, { bio: bio.slice(0, 500) }),
      setQuote: (uid, quote) => get().updateProfile(uid, { quote: quote.slice(0, 200) }),
      setDisplayName: (uid, name) => get().updateProfile(uid, { displayName: name.slice(0, 30) || null }),
      setSocial: (uid, social) => get().updateProfile(uid, { social }),
      setFavoriteGenres: (uid, ids) => get().updateProfile(uid, { favoriteGenres: ids.slice(0, 6) }),

      toggleShowcase: (uid, animeId) => {
        const cur = get().getProfile(uid)
        const list = cur.showcaseAnimeIds || []
        const next = list.includes(animeId)
          ? list.filter((id) => id !== animeId)
          : list.length < 10
            ? [...list, animeId]
            : list
        get().updateProfile(uid, { showcaseAnimeIds: next })
      },

      resetProfile: (uid) => {
        const all = { ...get().profiles }
        delete all[uid]
        set({ profiles: all })
      },

      unlockAchievement: (uid, achievementId) => {
        const all = { ...get().achievements }
        const cur = all[uid] || []
        if (cur.find((a) => a.id === achievementId)) return false
        all[uid] = [...cur, { id: achievementId, unlockedAt: Date.now() }]
        set({ achievements: all })
        return true
      },

      getUnlocked: (uid) => get().achievements[uid] || [],
      isUnlocked: (uid, id) =>
        !!(get().achievements[uid] || []).find((a) => a.id === id),
    }),
    {
      name: 'animeflux:profile',
      version: 1,
    },
  ),
)
