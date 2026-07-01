// Хранилище авторизации.
// Поддерживает Firebase (если настроен .env) или mock-режим (localStorage).

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider, isFirebaseConfigured } from '@/lib/firebase'

export interface AppUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

interface AuthState {
  user: AppUser | null
  loading: boolean
  error: string | null
  initialized: boolean
  init: () => void
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

function toAppUser(u: FirebaseUser): AppUser {
  return {
    uid: u.uid,
    email: u.email,
    displayName: u.displayName,
    photoURL: u.photoURL,
  }
}

// --- Mock implementation (когда Firebase не настроен) ---
const MOCK_USERS_KEY = 'animeflux:mockUsers'
const MOCK_SESSION_KEY = 'animeflux:mockSession'

interface MockUserRecord {
  uid: string
  email: string
  password: string
  displayName: string
  photoURL: string | null
}

function loadMockUsers(): MockUserRecord[] {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]')
  } catch {
    return []
  }
}
function saveMockUsers(users: MockUserRecord[]) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      error: null,
      initialized: false,

      init: () => {
        if (get().initialized) return
        if (isFirebaseConfigured && auth) {
          onAuthStateChanged(auth, (u) => {
            set({ user: u ? toAppUser(u) : null, initialized: true })
          })
        } else {
          // mock: восстановим сессию
          try {
            const session = localStorage.getItem(MOCK_SESSION_KEY)
            if (session) set({ user: JSON.parse(session) })
          } catch {}
          set({ initialized: true })
        }
      },

      signUp: async (email, password, displayName) => {
        set({ loading: true, error: null })
        try {
          if (isFirebaseConfigured && auth) {
            const cred = await createUserWithEmailAndPassword(auth, email, password)
            await updateProfile(cred.user, { displayName })
            set({ user: { ...toAppUser(cred.user), displayName } })
          } else {
            const users = loadMockUsers()
            if (users.find((u) => u.email === email)) {
              throw new Error('Пользователь с таким email уже существует')
            }
            const record: MockUserRecord = {
              uid: 'mock_' + Math.random().toString(36).slice(2, 12),
              email,
              password,
              displayName,
              photoURL: null,
            }
            users.push(record)
            saveMockUsers(users)
            const appUser: AppUser = {
              uid: record.uid,
              email: record.email,
              displayName: record.displayName,
              photoURL: null,
            }
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(appUser))
            set({ user: appUser })
          }
        } catch (e: any) {
          set({ error: humanizeError(e) })
          throw e
        } finally {
          set({ loading: false })
        }
      },

      signIn: async (email, password) => {
        set({ loading: true, error: null })
        try {
          if (isFirebaseConfigured && auth) {
            const cred = await signInWithEmailAndPassword(auth, email, password)
            set({ user: toAppUser(cred.user) })
          } else {
            const users = loadMockUsers()
            const found = users.find((u) => u.email === email && u.password === password)
            if (!found) throw new Error('Неверный email или пароль')
            const appUser: AppUser = {
              uid: found.uid,
              email: found.email,
              displayName: found.displayName,
              photoURL: found.photoURL,
            }
            localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(appUser))
            set({ user: appUser })
          }
        } catch (e: any) {
          set({ error: humanizeError(e) })
          throw e
        } finally {
          set({ loading: false })
        }
      },

      signInWithGoogle: async () => {
        set({ loading: true, error: null })
        try {
          if (isFirebaseConfigured && auth && googleProvider) {
            const cred = await signInWithPopup(auth, googleProvider)
            set({ user: toAppUser(cred.user) })
          } else {
            throw new Error('Google-вход доступен только при настроенном Firebase')
          }
        } catch (e: any) {
          set({ error: humanizeError(e) })
          throw e
        } finally {
          set({ loading: false })
        }
      },

      logout: async () => {
        if (isFirebaseConfigured && auth) {
          await signOut(auth)
        } else {
          localStorage.removeItem(MOCK_SESSION_KEY)
        }
        set({ user: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'animeflux:auth',
      partialize: (s) => ({ user: s.user }),
    }
  )
)

function humanizeError(e: any): string {
  const code = e?.code || ''
  if (code.includes('email-already-in-use')) return 'Email уже зарегистрирован'
  if (code.includes('invalid-email')) return 'Некорректный email'
  if (code.includes('weak-password')) return 'Слишком слабый пароль (минимум 6 символов)'
  if (code.includes('user-not-found') || code.includes('wrong-password') || code.includes('invalid-credential'))
    return 'Неверный email или пароль'
  if (code.includes('popup-closed')) return 'Окно входа закрыто'
  return e?.message || 'Произошла ошибка'
}
