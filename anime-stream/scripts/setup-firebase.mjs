#!/usr/bin/env node
// Хелпер для быстрой настройки .env.local из firebaseConfig объекта.
//
// Использование:
//   1) Скопируйте объект firebaseConfig из консоли Firebase
//   2) Запустите: node scripts/setup-firebase.mjs
//   3) Вставьте объект (можно с TODO-комментариями), нажмите Ctrl+D (Linux/Mac) или Ctrl+Z+Enter (Windows)
//
// Скрипт распарсит конфиг и создаст .env.local с правильными переменными.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const ENV_PATH = resolve(ROOT, '.env.local')

const KEY_MAP = {
  apiKey: 'VITE_FIREBASE_API_KEY',
  authDomain: 'VITE_FIREBASE_AUTH_DOMAIN',
  projectId: 'VITE_FIREBASE_PROJECT_ID',
  storageBucket: 'VITE_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'VITE_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'VITE_FIREBASE_APP_ID',
  measurementId: 'VITE_FIREBASE_MEASUREMENT_ID',
}

function readStdinSync() {
  try {
    return readFileSync(0, 'utf-8')
  } catch {
    return ''
  }
}

const raw = readStdinSync().trim()

if (!raw) {
  console.error(
    '\n❌ Ничего не получил на stdin.\n\n' +
    '👉 Использование: вставьте конфиг firebaseConfig через pipe или прямо в терминал:\n' +
    '   node scripts/setup-firebase.mjs < my-config.js\n' +
    '   или: cat firebase-config.txt | node scripts/setup-firebase.mjs\n' +
    '   или: node scripts/setup-firebase.mjs (вставить и Ctrl+D)\n',
  )
  process.exit(1)
}

// Простой парсер: ищем все ключ: "значение" пары
const values = {}
for (const [key] of Object.entries(KEY_MAP)) {
  const re = new RegExp(`${key}\\s*:\\s*["'\`]([^"'\`]+)["'\`]`)
  const match = raw.match(re)
  if (match) values[key] = match[1]
}

if (Object.keys(values).length === 0) {
  console.error('\n❌ Не удалось найти ни одного поля firebaseConfig в вводе.\n')
  process.exit(1)
}

// Подгружаем существующий .env.local чтобы не затереть не-Firebase переменные
let existing = ''
if (existsSync(ENV_PATH)) {
  existing = readFileSync(ENV_PATH, 'utf-8')
}

// Удаляем старые VITE_FIREBASE_* строки
const lines = existing
  .split('\n')
  .filter((l) => !Object.values(KEY_MAP).some((envKey) => l.trim().startsWith(envKey + '=')))

// Добавляем новые
lines.push('')
lines.push('# === Firebase (сгенерировано scripts/setup-firebase.mjs) ===')
for (const [cfgKey, envKey] of Object.entries(KEY_MAP)) {
  lines.push(`${envKey}=${values[cfgKey] || ''}`)
}

writeFileSync(ENV_PATH, lines.join('\n').replace(/\n{3,}/g, '\n\n').trim() + '\n')

console.log('\n✅ Файл .env.local обновлён!')
console.log(`📂 Путь: ${ENV_PATH}\n`)
console.log('Распознаны поля:')
for (const [cfgKey, envKey] of Object.entries(KEY_MAP)) {
  const v = values[cfgKey]
  if (v) {
    const masked = v.length > 10 ? v.slice(0, 6) + '...' + v.slice(-4) : v
    console.log(`   ${envKey.padEnd(40)} = ${masked}`)
  } else {
    console.log(`   ${envKey.padEnd(40)} ⚠️  не найдено`)
  }
}

// Проверка минимально необходимых полей
const required = ['apiKey', 'projectId', 'appId']
const missing = required.filter((k) => !values[k])
if (missing.length) {
  console.log(`\n⚠️  ВНИМАНИЕ: не найдены обязательные поля: ${missing.join(', ')}`)
  console.log('   Firebase будет работать в mock-режиме (без облака).')
} else {
  console.log('\n✅ Все обязательные поля на месте — Firebase должен заработать.')
}

console.log('\n🚀 ВАЖНО: полностью перезапустите dev-сервер!')
console.log('   1. В терминале где запущен dev: Ctrl+C')
console.log('   2. Запустите снова: npm run dev')
console.log('   (Vite читает .env.local ТОЛЬКО при старте, hot-reload не поможет)')
