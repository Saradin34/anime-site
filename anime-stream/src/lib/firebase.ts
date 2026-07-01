// Firebase инициализация.
// Конфиг берётся из переменных окружения VITE_FIREBASE_* (см. .env.example).
// Если переменных нет — авторизация переключится в mock-режим (localStorage).

import { initializeApp, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
} from 'firebase/auth'
import {
  getAnalytics,
  isSupported as analyticsSupported,
  type Analytics,
} from 'firebase/analytics'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const isFirebaseConfigured = Boolean(
  config.apiKey && config.projectId && config.appId,
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null
let analytics: Analytics | null = null

if (isFirebaseConfigured) {
  app = initializeApp(config as Record<string, string>)
  auth = getAuth(app)

  // Google провайдер с запросом email и фото
  googleProvider = new GoogleAuthProvider()
  googleProvider.addScope('email')
  googleProvider.addScope('profile')
  // Всегда показывать выбор аккаунта, не подставлять последний автоматически
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  // Analytics — только в браузере и только если поддерживается + есть measurementId
  if (typeof window !== 'undefined' && config.measurementId) {
    analyticsSupported()
      .then((ok) => {
        if (ok && app) analytics = getAnalytics(app)
      })
      .catch(() => { /* молча игнорируем */ })
  }

  // Отладочный лог только в dev — никаких секретов наружу
  if (import.meta.env.DEV) {
    console.info(
      `%c[Firebase] инициализирован`,
      'color:#a855f7;font-weight:bold',
      `project=${config.projectId}, analytics=${!!config.measurementId}`,
    )
  }
} else if (import.meta.env.DEV) {
  // Диагностика: какие поля распознаны, какие пустые
  const status = Object.entries(config).map(([k, v]) => {
    const ok = !!v && String(v).length > 0
    return `  ${ok ? '✅' : '❌'} ${k.padEnd(20)} = ${ok ? String(v).slice(0, 8) + '...' : '(ПУСТО)'}`
  }).join('\n')

  console.warn(
    '%c[Firebase] НЕ настроен — работает mock-режим (localStorage).',
    'color:#f59e0b;font-weight:bold;font-size:13px',
  )
  console.warn(
    'Состояние переменных окружения (нужны apiKey, projectId, appId как минимум):\n' + status,
  )
  console.warn(
    'Проверьте:\n' +
    '  1. Файл называется именно ".env.local" (с точкой в начале)\n' +
    '  2. Файл лежит в корне проекта (рядом с package.json), а НЕ в src/\n' +
    '  3. Все переменные начинаются с префикса VITE_ (иначе Vite их не видит)\n' +
    '  4. Перезапустите dev-сервер: Ctrl+C → npm run dev\n' +
    '  5. Значения БЕЗ кавычек: VITE_FIREBASE_API_KEY=AIzaSy... (не "AIzaSy...")',
  )
}

export { app, auth, googleProvider, analytics }
