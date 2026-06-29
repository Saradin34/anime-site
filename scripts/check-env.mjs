import { existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const FILES = [
  '.env',
  '.env.local',
  '.env.development',
  '.env.development.local',
]

const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
]

console.log(`\n📂 Корень проекта: ${ROOT}\n`)
console.log('Проверяю .env-файлы которые читает Vite:\n')

const merged = {}
let foundAny = false

for (const f of FILES) {
  const p = resolve(ROOT, f)
  const exists = existsSync(p)
  console.log(`  ${exists ? '✅' : '⚪️'} ${f.padEnd(28)} ${exists ? p : '(нет)'}`)
  if (exists) {
    foundAny = true
    const content = readFileSync(p, 'utf-8')
    const lines = content.split('\n')
    for (const line of lines) {
      const t = line.trim()
      if (!t || t.startsWith('#')) continue
      const eq = t.indexOf('=')
      if (eq < 0) continue
      let key = t.slice(0, eq).trim()
      let val = t.slice(eq + 1).trim()
      // снимаем кавычки если есть
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      merged[key] = val
    }
  }
}

if (!foundAny) {
  console.log('\n❌ Ни одного .env-файла не найдено!')
  console.log('   Создайте .env.local в корне проекта (см. .env.example как образец)')
  console.log('   или запустите: npm run setup:firebase')
  process.exit(1)
}

console.log('\n📋 Firebase переменные:\n')
let allRequiredPresent = true
for (const k of REQUIRED) {
  const v = merged[k]
  if (v) {
    const masked = v.length > 12 ? v.slice(0, 6) + '...' + v.slice(-4) : v
    console.log(`  ✅ ${k.padEnd(38)} = ${masked}`)
  } else {
    console.log(`  ❌ ${k.padEnd(38)} = (отсутствует)`)
    if (k !== 'VITE_FIREBASE_MEASUREMENT_ID') allRequiredPresent = false
  }
}

console.log()
if (allRequiredPresent) {
  console.log('✅ Все обязательные переменные на месте — Firebase должен работать.')
  console.log('   Если в браузере всё ещё видите "Firebase НЕ настроен" —')
  console.log('   значит dev-сервер не перезапущен. Сделайте Ctrl+C → npm run dev')
} else {
  console.log('⚠️  Не хватает обязательных переменных. Проверьте .env.local')
  console.log('   или запустите: npm run setup:firebase')
}
console.log()
