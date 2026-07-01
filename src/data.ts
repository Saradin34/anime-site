import type { Anime } from './types/anime';

export const demoAnime: Anime[] = [
  {
    id: 'demo-cyber-sakura', source: 'local', title: 'Кибер-Сакура: Нулевой Рассвет', englishTitle: 'Cyber Sakura: Zero Dawn',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1541562232579-512a21360020?auto=format&fit=crop&w=1600&q=80',
    description: 'Неоновый мегаполис, тайные кланы и девушка-хакер, способная слышать цифровые души. Демо-карточка показывает, как будут выглядеть тайтлы, если внешний API временно недоступен.',
    genres: ['Киберпанк','Экшен','Драма'], year: 2026, status: 'Онгоинг', type: 'TV', rating: 8.7, episodesCount: 3,
    episodes: [
      { id: 'demo-1', number: 1, title: 'Пробуждение сети', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'demo-2', number: 2, title: 'Город под дождём', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'demo-3', number: 3, title: 'Сердце протокола', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
  },
  {
    id: 'demo-moon-ronin', source: 'local', title: 'Лунный Ронин', englishTitle: 'Moon Ronin',
    poster: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?auto=format&fit=crop&w=800&q=80',
    banner: 'https://images.unsplash.com/photo-1531501410720-c8d437636169?auto=format&fit=crop&w=1600&q=80',
    description: 'Самурай без прошлого ищет клинок, который отражает не свет, а воспоминания владельца.',
    genres: ['Самураи','Фэнтези','Приключения'], year: 2025, status: 'Завершён', type: 'TV', rating: 8.3, episodesCount: 2,
    episodes: [
      { id: 'ronin-1', number: 1, title: 'Тень катаны', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
      { id: 'ronin-2', number: 2, title: 'Мост тысячи фонарей', embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    ],
  },
];
