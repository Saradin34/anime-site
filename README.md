# AnimeNova

Полноценный красивый аниме-сайт на **React + TypeScript + Vite**, подготовленный под деплой на **Netlify**.

## Что реализовано

- Главная страница с hero-блоком и обновлениями.
- Каталог с поиском.
- Страница тайтла с маршрутизацией `/anime/:source/:id`.
- Серии находятся внутри карточек и на странице просмотра.
- HLS-плеер через `hls.js` для `.m3u8` потоков.
- Демо-авторизация: вход/регистрация через `localStorage`.
- Избранное, защищённая страница `/favorites`.
- Адаптивный glass/neon дизайн.
- Netlify redirects/proxy для API и SPA fallback.

## Источники данных

1. **AniLibria v3** — каталог и HLS-серии, если API доступен из региона.
2. **Jikan API** — бесплатный fallback MyAnimeList без ключа.
3. **Demo data** — локальные карточки, если внешние API недоступны.

> В коде есть единая модель `Anime` / `Episode`, поэтому AnimeVost, Anime-bit и другие источники можно подключать отдельными адаптерами.

## Важное про парсеры

Парсинг чужих сайтов лучше делать не в браузере, а через backend или Netlify Functions:

- обход CORS;
- нормализация данных под `Anime`;
- соблюдение правил сайтов и авторских прав;
- кэширование результатов;
- скрытие логики парсинга.

## Запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

## Деплой на Netlify

1. Залить проект на GitHub/GitLab.
2. В Netlify выбрать **Add new site → Import an existing project**.
3. Build command: `npm run build`.
4. Publish directory: `dist`.
5. Файл `netlify.toml` уже настроен.

## Структура

```txt
src/
  components/      UI-компоненты
  context/         авторизация
  hooks/           избранное
  pages/           страницы маршрутов
  services/        API адаптеры
  types/           TypeScript типы
```
