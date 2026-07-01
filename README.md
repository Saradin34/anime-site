# 🎬 AnimeFlux

Современный сайт для просмотра аниме онлайн.
Stack: **React 18 + TypeScript + Vite + Tailwind CSS + Firebase + AniLibria API + Netlify Functions**.

![tech](https://img.shields.io/badge/React-18-61dafb) ![tech](https://img.shields.io/badge/TypeScript-5-3178c6) ![tech](https://img.shields.io/badge/Vite-5-646cff) ![tech](https://img.shields.io/badge/Tailwind-3-06b6d4) ![tech](https://img.shields.io/badge/Netlify-Functions-00C7B7)

## ✨ Возможности

- 🎥 **Встроенный HLS-плеер** (hls.js) — все серии играются прямо внутри карточки аниме
- 🌐 **Мульти-провайдерный агрегатор** — единый плеер с переключателем источников: AniLibria (RU дубляж) + HiAnime (EN sub/dub). Автоматический матчинг по названию.
- 🌓 **Тёмная и светлая тема** (+ системная) — переключается мгновенно, без вспышки при загрузке
- 🔐 **Авторизация Firebase** (email/password + Google) с fallback на localStorage
- 🧭 **Полная маршрутизация** (React Router 6): главная, каталог, карточка, топ, жанры, расписание, профиль
- ♾️ **Бесконечная прокрутка** в каталоге через IntersectionObserver
- 🎨 **Современный neon-glassmorphism UI** с поддержкой обеих тем
- 🔎 **Глобальный поиск** с ⌘K, мгновенными подсказками
- 📋 **Списки**: смотрю, запланировано, просмотрено, брошено, избранное
- ⭐ **Личные оценки 1–10**
- 📜 **История просмотра** с прогрессом серий
- 💬 **Комментарии и лайки**
- 🔔 **Уведомления** о новых сериях
- 🗓️ **Расписание выхода серий по дням недели**
- 🖼️ **HD-постеры** с blur-up загрузкой (WebP + JPG fallback)
- 📱 Полностью адаптивный дизайн (mobile-first)
- 🚀 Готов к деплою на **Netlify** в один клик (включая HiAnime API через Netlify Functions)

## 🚀 Быстрый старт

```bash
# 1. Установка зависимостей
npm install

# 2. (Опционально) Настройте Firebase — без него работает mock-режим
cp .env.example .env.local
# Заполните VITE_FIREBASE_* значениями из консоли Firebase

# 3. Запуск dev-сервера
npm run dev
```

Откройте http://localhost:5173

В dev-режиме Aniwatch endpoints `/api/aniwatch/*` обслуживает встроенный vite-middleware (тот же код что и Netlify Function). Если хотите эмулировать полную production-среду:

```bash
npm install -g netlify-cli
npm run netlify:dev   # запустит netlify dev на http://localhost:8888
```

## 🔥 Настройка Firebase (опционально)

1. Создайте проект на https://console.firebase.google.com
2. Authentication → Sign-in method → включите **Email/Password** и **Google**
3. Project settings → копируйте config в `.env.local`:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

> Без Firebase сайт работает в mock-режиме: регистрация/вход через localStorage.

## 📦 Деплой на Netlify

### Вариант 1: Drag-and-drop (быстро)

```bash
npm run build
```

Затем зайдите на https://app.netlify.com/drop и перетащите папку `dist/`.

⚠️ Этот вариант НЕ задеплоит Netlify Functions (HiAnime API не будет работать). Используйте только если HiAnime вам не нужен.

### Вариант 2: Git-интеграция (рекомендуется)

1. Запушьте код в GitHub / GitLab / Bitbucket
2. Зайдите на https://app.netlify.com → **Add new site** → **Import from Git**
3. Выберите репозиторий
4. Netlify автоматически прочитает `netlify.toml` и подставит:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
5. В **Site settings → Environment variables** добавьте ваши `VITE_FIREBASE_*` (если используете Firebase)
6. Нажмите **Deploy**

### Вариант 3: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init        # привязать проект к Netlify
npm run netlify:deploy:prod
```

### Что задеплоится

- 🌐 Фронтенд (статика `dist/`) — на CDN Netlify
- ⚡ Netlify Function `netlify/functions/aniwatch.ts` — обслуживает `/api/aniwatch/*` (HiAnime прокси)
- 🔀 SPA-роутинг — React Router работает на любых URL через `_redirects`

## 📁 Структура

```
anime-stream/
├── netlify/
│   └── functions/
│       └── aniwatch.ts          # Netlify Function: прокси к npm-пакету aniwatch
├── dev-server.ts                # Те же эндпоинты для vite dev (одна логика)
├── netlify.toml                 # Конфиг Netlify (build, redirects, functions)
├── public/
│   └── _redirects               # Fallback-правила для SPA + API
├── src/
│   ├── api/
│   │   ├── anilibria.ts         # Клиент AniLiberty API v1
│   │   └── providers/
│   │       ├── types.ts         # Универсальные типы (SourceTrack, ProviderMatch...)
│   │       ├── hianime.ts       # Клиент к /api/aniwatch + нечёткий матчинг
│   │       └── aggregator.ts    # Объединение AniLibria + HiAnime в один плеер
│   ├── components/
│   │   ├── layout/              # Navbar, Footer, Layout
│   │   ├── AnimeCard.tsx
│   │   ├── AnimeGrid.tsx
│   │   ├── CatalogSection.tsx   # Каталог с фильтрами + lazy loading
│   │   ├── HeroSlider.tsx
│   │   ├── HorizontalRail.tsx
│   │   ├── InfiniteSentinel.tsx # Бесконечная прокрутка
│   │   ├── SearchModal.tsx
│   │   ├── SmartImage.tsx       # HD-картинки с blur-up
│   │   ├── ThemeToggle.tsx      # Переключатель темы
│   │   ├── VideoPlayer.tsx      # HLS-плеер с переключателем источников
│   │   └── ProtectedRoute.tsx
│   ├── pages/                   # Все маршруты (HomePage, CatalogPage, AnimePage...)
│   ├── store/                   # Zustand (authStore, userStore, themeStore)
│   ├── lib/                     # Firebase init
│   ├── types/                   # TypeScript типы AniLibria
│   └── styles/                  # Tailwind + CSS-переменные для тем
└── index.html                   # Inline-скрипт для применения темы до рендера
```

## 🔌 Aniwatch (HiAnime) API endpoints

Доступны на `/api/aniwatch/*` как локально (через vite middleware), так и в продакшене (Netlify Functions):

| Endpoint | Параметры | Описание |
|---|---|---|
| `/home` | — | Главная HiAnime (топ/тренды/spotlight) |
| `/search` | `q`, `page` | Поиск аниме |
| `/info` | `id` | Детальная информация |
| `/episodes` | `id` | Список эпизодов |
| `/servers` | `episodeId` | Доступные серверы для серии |
| `/sources` | `episodeId`, `server`, `category=sub\|dub` | HLS-ссылки |
| `/schedule` | `date`, `tz` | Расписание |
| `/category` | `name`, `page` | Категории (most-popular, top-airing...) |
| `/genre` | `name`, `page` | По жанрам |

В ответе всегда `{ success: boolean, data?: ..., error?: string }`.

## 🎬 Источники видео

Сайт использует **два независимых провайдера**, объединённых в одном плеере:

### 1. AniLibria (основной, RU дубляж)
Актуальный **AniLiberty API v1** ([anilibria.top/api/docs/v1](https://anilibria.top/api/docs/v1)) — открытый API от команды AniLibria с бесплатным CORS, HLS-стримами в трёх качествах (480p/720p/1080p), превью эпизодов и тайм-кодами опенингов/эндингов.

> ⚠️ Старый `api.anilibria.tv/v3` отключён 7 августа 2025 года.

API-клиент автоматически использует резервные хосты (`api.anilibria.app`, `anilibria.top`, `aniliberty.top`) если основной недоступен.

### 2. HiAnime / Aniwatch (опционально, EN sub+dub)
Используется npm-пакет [`aniwatch`](https://www.npmjs.com/package/aniwatch) (scraper для hianimez.to), запускаемый **на нашей собственной Netlify Function** (`netlify/functions/aniwatch.ts`). Запросы идут через тот же домен — **никаких CORS-проблем** и rate-limits публичных демо-инстансов.

**Как работает мульти-провайдер:**
- При открытии карточки аниме сайт параллельно ищет совпадение на HiAnime (по английскому/японскому названию, нечёткое сравнение).
- Если найдено совпадение ≥55%, для текущей серии динамически догружаются sub/dub дорожки HiAnime.
- В плеере появляется иконка 🌐 — выпадающий список со всеми доступными источниками.
- Если у HiAnime ничего не нашлось — просто работает AniLibria (graceful degradation).

> 💡 **Важно**: HiAnime блокирует некоторые cloud-IP через Cloudflare. Netlify Functions работают на AWS Lambda — обычно проблем нет, но если видите в логах "пустые" ответы, отключите HiAnime через `VITE_ENABLE_HIANIME=false` в переменных окружения сайта.

Все права на видео и контент принадлежат их правообладателям. Этот проект — учебный/демонстрационный.

## 🎨 Темы

Переключатель в правом верхнем углу — иконка солнца/луны. Три режима:

- **Светлая** — мягкий белый фон с фиолетовыми акцентами
- **Тёмная** — глубокий тёмный с неоновыми градиентами (по умолчанию)
- **Системная** — следует за `prefers-color-scheme` ОС, реактивно

Реализовано через CSS-переменные на `html.dark` / `html.light`. Inline-скрипт в `index.html` применяет тему **до** рендера React — нет вспышки при загрузке. Сохраняется в localStorage.

## 📄 Лицензия

MIT — пользуйтесь, дорабатывайте, делитесь.
