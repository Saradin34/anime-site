import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, History, ListVideo, Bell, Check, LogOut, X, Trash2,
  Pencil, Save, Quote as QuoteIcon, Clock, Film, Star, Trophy, Eye, Calendar,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useProfileStore } from '@/store/profileStore'
import { useProfileStats } from '@/hooks/useProfileStats'
import AvatarUploader from '@/components/profile/AvatarUploader'
import CoverUploader from '@/components/profile/CoverUploader'
import GenreDonut from '@/components/profile/GenreDonut'
import ActivityHeatmap from '@/components/profile/ActivityHeatmap'
import AchievementsGrid from '@/components/profile/AchievementsGrid'
import FavoritesShowcase from '@/components/profile/FavoritesShowcase'
import SocialLinksBlock from '@/components/profile/SocialLinks'
import ShowcasePicker from '@/components/profile/ShowcasePicker'
import { ACHIEVEMENTS } from '@/lib/achievements'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const {
    getList, getHistory,
    getNotifications, markAllRead, markRead, removeNotification, clearNotifications,
  } = useUserStore()
  const {
    getProfile, setAvatar, setCover, setBio, setQuote, setDisplayName,
    setSocial, toggleShowcase, getUnlocked,
  } = useProfileStore()

  if (!user) return null

  const profile = getProfile(user.uid)
  const stats = useProfileStats(user.uid)
  const unlockedAchievements = getUnlocked(user.uid)

  const notifications = getNotifications(user.uid)
  const unread = notifications.filter((n) => !n.read).length
  const history = getHistory(user.uid)
  const all = getList(user.uid)

  // Кандидаты для витрины: избранное + смотрю + просмотрено
  const candidateIds = useMemo(() => {
    const ids = new Set<number>()
    for (const e of all) {
      if (e.isFavorite || e.list === 'watching' || e.list === 'completed') ids.add(e.animeId)
    }
    return Array.from(ids)
  }, [all])

  const candidates = candidateIds
    .map((id) => stats.enrichedLists.get(id))
    .filter(Boolean) as any[]

  const showcase = (profile.showcaseAnimeIds || [])
    .map((id) => stats.enrichedLists.get(id))
    .filter(Boolean) as any[]

  // Состояния редактирования
  const [editingName, setEditingName] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [editingBio, setEditingBio] = useState(false)
  const [draftBio, setDraftBio] = useState('')
  const [editingQuote, setEditingQuote] = useState(false)
  const [draftQuote, setDraftQuote] = useState('')
  const [showcasePickerOpen, setShowcasePickerOpen] = useState(false)

  const effectiveName = profile.displayName || user.displayName || user.email?.split('@')[0] || 'Пользователь'
  const initial = (effectiveName || 'U').charAt(0)

  const startEditName = () => { setDraftName(profile.displayName || effectiveName); setEditingName(true) }
  const saveName = () => { setDisplayName(user.uid, draftName.trim()); setEditingName(false) }
  const startEditBio = () => { setDraftBio(profile.bio || ''); setEditingBio(true) }
  const saveBio = () => { setBio(user.uid, draftBio); setEditingBio(false) }
  const startEditQuote = () => { setDraftQuote(profile.quote || ''); setEditingQuote(true) }
  const saveQuote = () => { setQuote(user.uid, draftQuote); setEditingQuote(false) }

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-8">
      {/* ============ HERO: обложка + аватар + ник ============ */}
      <section className="relative mb-8">
        <CoverUploader
          src={profile.cover}
          onChange={(d) => setCover(user.uid, d)}
        />

        {/* Аватар + базовая инфа поверх обложки */}
        <div className="relative px-4 md:px-8 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-4">
          <AvatarUploader
            src={profile.avatar || user.photoURL}
            fallbackInitial={initial}
            size={140}
            onChange={(d) => setAvatar(user.uid, d)}
          />

          <div className="flex-1 text-center md:text-left min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2 max-w-md mx-auto md:mx-0">
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  maxLength={30}
                  className="input py-1.5 text-2xl font-display font-bold"
                  autoFocus
                />
                <button onClick={saveName} className="btn-primary p-2"><Save size={16} /></button>
                <button onClick={() => setEditingName(false)} className="btn-ghost p-2"><X size={16} /></button>
              </div>
            ) : (
              <h1 className="font-display text-3xl md:text-4xl font-bold flex items-center gap-2 justify-center md:justify-start group">
                <span className="truncate">{effectiveName}</span>
                <button
                  onClick={startEditName}
                  className="text-text-dim hover:text-neon-pink opacity-0 group-hover:opacity-100 transition"
                  title="Сменить ник"
                >
                  <Pencil size={16} />
                </button>
              </h1>
            )}
            <p className="text-text-muted text-sm mt-1">{user.email}</p>

            <div className="flex flex-wrap items-center gap-2 mt-3 justify-center md:justify-start">
              <span className="chip"><Calendar size={11} /> {stats.daysOnSite} дн. на сайте</span>
              <span className="chip"><Film size={11} /> {stats.totalEntries} в списках</span>
              <span className="chip"><Heart size={11} className="text-neon-pink" fill="currentColor" /> {stats.favorites}</span>
              <span className="chip"><Trophy size={11} className="text-yellow-400" /> {unlockedAchievements.length}/{ACHIEVEMENTS.length}</span>
            </div>
          </div>

          <button onClick={logout} className="btn-ghost shrink-0">
            <LogOut size={18} /> Выйти
          </button>
        </div>
      </section>

      {/* ============ Био + цитата ============ */}
      <section className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Био */}
        <div className="md:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">📝 О себе</h3>
            {!editingBio && (
              <button onClick={startEditBio} className="text-text-muted hover:text-text text-sm flex items-center gap-1">
                <Pencil size={12} /> {profile.bio ? 'Изменить' : 'Добавить'}
              </button>
            )}
          </div>
          {editingBio ? (
            <>
              <textarea
                value={draftBio}
                onChange={(e) => setDraftBio(e.target.value)}
                maxLength={500}
                rows={5}
                placeholder="Расскажите о себе, любимых жанрах, что смотрите..."
                className="input resize-none text-sm"
                autoFocus
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-text-dim">{draftBio.length}/500</span>
                <div className="flex gap-2">
                  <button onClick={() => setEditingBio(false)} className="btn-ghost text-sm">Отмена</button>
                  <button onClick={saveBio} className="btn-primary text-sm"><Save size={14} /> Сохранить</button>
                </div>
              </div>
            </>
          ) : profile.bio ? (
            <p className="text-sm text-text-muted whitespace-pre-wrap">{profile.bio}</p>
          ) : (
            <p className="text-sm text-text-dim italic">Тут пока пусто. Расскажите немного о себе ✨</p>
          )}
        </div>

        {/* Любимая цитата */}
        <div className="glass rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute -top-6 -right-6 text-9xl opacity-5 select-none">"</div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold flex items-center gap-1.5">
                <QuoteIcon size={14} /> Любимая цитата
              </h3>
              {!editingQuote && (
                <button onClick={startEditQuote} className="text-text-muted hover:text-text">
                  <Pencil size={12} />
                </button>
              )}
            </div>
            {editingQuote ? (
              <>
                <textarea
                  value={draftQuote}
                  onChange={(e) => setDraftQuote(e.target.value)}
                  maxLength={200}
                  rows={3}
                  placeholder="«Я стану королём пиратов!»"
                  className="input resize-none text-sm italic"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingQuote(false)} className="btn-ghost text-xs">Отмена</button>
                  <button onClick={saveQuote} className="btn-primary text-xs">Сохранить</button>
                </div>
              </>
            ) : profile.quote ? (
              <blockquote className="text-sm italic text-text-muted">
                «{profile.quote}»
              </blockquote>
            ) : (
              <p className="text-sm text-text-dim italic">Добавьте любимую цитату...</p>
            )}
          </div>
        </div>
      </section>

      {/* ============ КРУПНАЯ СТАТИСТИКА ============ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatBigCard
          icon={<Clock size={20} />}
          value={stats.totalHours < 1 ? `${stats.totalMinutes}м` : `${Math.round(stats.totalHours)}ч`}
          label="Время просмотра"
          gradient="from-neon-purple to-neon-violet"
          sub={stats.totalDays >= 1 ? `≈ ${stats.totalDays.toFixed(1)} дней` : undefined}
        />
        <StatBigCard
          icon={<Eye size={20} />}
          value={stats.uniqueEpisodes}
          label="Серий посмотрено"
          gradient="from-neon-cyan to-blue-600"
        />
        <StatBigCard
          icon={<Star size={20} />}
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          label={`Средняя оценка${stats.ratingsCount > 0 ? ` (${stats.ratingsCount})` : ''}`}
          gradient="from-yellow-400 to-orange-500"
        />
        <StatBigCard
          icon={<Trophy size={20} />}
          value={`${unlockedAchievements.length}/${ACHIEVEMENTS.length}`}
          label="Достижений"
          gradient="from-neon-pink to-rose-600"
        />
      </section>

      {/* ============ ВИТРИНА ЛЮБИМЫХ ============ */}
      <div className="mb-8">
        <FavoritesShowcase
          items={showcase}
          candidates={candidates}
          selectedIds={profile.showcaseAnimeIds || []}
          editable
          onToggle={(id) => toggleShowcase(user.uid, id)}
          onOpenPicker={() => setShowcasePickerOpen(true)}
        />
      </div>

      {/* ============ СТАТУСЫ СПИСКОВ (быстрые ссылки) ============ */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <QuickListCard label="Смотрю"        value={stats.watching}  to="/lists/watching"  color="from-neon-purple to-neon-violet" />
        <QuickListCard label="Запланировано" value={stats.planned}   to="/lists/planned"   color="from-neon-cyan to-neon-purple" />
        <QuickListCard label="Просмотрено"   value={stats.completed} to="/lists/completed" color="from-green-500 to-emerald-500" />
        <QuickListCard label="Брошено"       value={stats.dropped}   to="/lists/dropped"   color="from-orange-500 to-red-500" />
      </section>

      {/* ============ ГРАФИКИ ============ */}
      <section className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="glass rounded-2xl p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            🎭 Жанры в коллекции
            {stats.loading && <span className="text-xs text-text-dim font-normal">подгружаем...</span>}
          </h3>
          <GenreDonut items={stats.genreDistribution} />
        </div>
        <div className="glass rounded-2xl p-5">
          <ActivityHeatmap items={stats.activityHeatmap} />
        </div>
      </section>

      {/* ============ ДОСТИЖЕНИЯ ============ */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Trophy size={22} className="text-yellow-400" /> Достижения
            <span className="text-sm text-text-muted font-normal">
              {unlockedAchievements.length}/{ACHIEVEMENTS.length}
            </span>
          </h2>
        </div>
        <AchievementsGrid unlocked={unlockedAchievements} />
      </section>

      {/* ============ СОЦИАЛЬНЫЕ ССЫЛКИ ============ */}
      <section className="mb-8">
        <SocialLinksBlock
          value={profile.social || {}}
          editable
          onChange={(next) => setSocial(user.uid, next)}
        />
      </section>

      {/* ============ Быстрые ссылки (избранное / история / списки) ============ */}
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <Link to="/favorites" className="glass rounded-2xl p-5 hover:bg-hover-strong transition group">
          <Heart size={28} className="text-neon-pink mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold">Избранное</h3>
          <p className="text-text-muted text-sm mt-1">{stats.favorites} аниме</p>
        </Link>
        <Link to="/history" className="glass rounded-2xl p-5 hover:bg-hover-strong transition group">
          <History size={28} className="text-neon-cyan mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold">История</h3>
          <p className="text-text-muted text-sm mt-1">{history.length} записей</p>
        </Link>
        <Link to="/lists" className="glass rounded-2xl p-5 hover:bg-hover-strong transition group">
          <ListVideo size={28} className="text-neon-purple mb-3 group-hover:scale-110 transition" />
          <h3 className="font-semibold">Все списки</h3>
          <p className="text-text-muted text-sm mt-1">{stats.totalEntries} аниме</p>
        </Link>
      </div>

      {/* ============ УВЕДОМЛЕНИЯ ============ */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Bell size={22} /> Уведомления
            {unread > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple font-bold text-white">
                {unread}
              </span>
            )}
          </h2>
          <div className="flex gap-2">
            {unread > 0 && (
              <button onClick={() => markAllRead(user.uid)} className="btn-ghost text-sm">
                <Check size={14} /> Прочитать все
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={() => { if (confirm('Удалить все уведомления?')) clearNotifications(user.uid) }}
                className="btn-ghost text-sm text-red-400 hover:!text-red-300"
              >
                <Trash2 size={14} /> Очистить
              </button>
            )}
          </div>
        </div>
        {notifications.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-text-muted">
            <Bell size={40} className="mx-auto mb-3 text-text-dim" />
            <p>Пока нет уведомлений</p>
            <p className="text-xs text-text-dim mt-1">
              Подпишитесь на аниме через колокольчик на странице тайтла
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`glass rounded-2xl p-3 flex items-center gap-3 hover:bg-hover transition group ${!n.read ? 'border-neon-purple/40' : ''}`}
              >
                <Link
                  to={`/anime/${n.alias}`}
                  onClick={() => markRead(user.uid, n.id)}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <img src={n.poster} alt={`Постер ${n.title}`} loading="lazy" className="w-12 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{n.title}</div>
                    <div className="text-sm text-text-muted">Новая серия: {n.episode}</div>
                    <div className="text-[11px] text-text-dim mt-0.5">
                      {new Date(n.createdAt).toLocaleString('ru-RU')}
                    </div>
                  </div>
                  {!n.read && (
                    <div className="w-2 h-2 rounded-full bg-neon-pink shrink-0" title="Не прочитано" />
                  )}
                </Link>
                <button
                  onClick={(e) => { e.stopPropagation(); removeNotification(user.uid, n.id) }}
                  className="shrink-0 p-2 rounded-lg text-text-dim hover:text-red-400 hover:bg-hover transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  aria-label="Удалить"
                  title="Удалить уведомление"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Модалка выбора витрины */}
      <ShowcasePicker
        open={showcasePickerOpen}
        onClose={() => setShowcasePickerOpen(false)}
        candidates={candidates}
        selectedIds={profile.showcaseAnimeIds || []}
        onToggle={(id) => toggleShowcase(user.uid, id)}
      />
    </div>
  )
}

// ============================================================

function StatBigCard({ icon, value, label, gradient, sub }: {
  icon: React.ReactNode; value: React.ReactNode; label: string; gradient: string; sub?: string
}) {
  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden">
      <div className={`absolute -top-4 -right-4 w-20 h-20 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-neon-sm mb-2`}>
          {icon}
        </div>
        <div className="text-2xl font-display font-bold leading-tight">{value}</div>
        <div className="text-xs text-text-muted mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-text-dim mt-0.5">{sub}</div>}
      </div>
    </div>
  )
}

function QuickListCard({ label, value, to, color }: { label: string; value: number; to: string; color: string }) {
  return (
    <Link to={to} className="glass rounded-2xl p-4 hover:bg-hover-strong transition group">
      <div className={`text-3xl font-display font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {value}
      </div>
      <div className="text-sm text-text-muted mt-1">{label}</div>
    </Link>
  )
}
