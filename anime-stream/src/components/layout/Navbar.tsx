import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  Search, Bell, User, Menu, X, LogOut, Heart, History,
  ListVideo, Home as HomeIcon, Trophy, Tags, Calendar, Film,
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useUserStore } from '@/store/userStore'
import { useProfileStore } from '@/store/profileStore'
import SearchModal from '@/components/SearchModal'
import ThemeToggle from '@/components/ThemeToggle'
import clsx from 'clsx'

const NAV = [
  { to: '/', label: 'Главная', icon: HomeIcon },
  { to: '/top', label: 'Топ-100', icon: Trophy },
  { to: '/genres', label: 'Жанры', icon: Tags },
  { to: '/schedule', label: 'Расписание', icon: Calendar },
]

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const notifications = useUserStore((s) => (user ? s.getNotifications(user.uid) : []))
  const unread = notifications.filter((n) => !n.read).length
  const profile = useProfileStore((s) => (user ? s.getProfile(user.uid) : null))
  const avatarSrc = profile?.avatar || user?.photoURL || null
  const effectiveName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || ''

  useEffect(() => {
    // Throttle через rAF: scroll-обработчик не дёргает React каждый кадр
    let ticking = false
    let lastScrolled = window.scrollY > 20
    setScrolled(lastScrolled)
    const onScroll = () => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const next = window.scrollY > 20
        if (next !== lastScrolled) {
          lastScrolled = next
          setScrolled(next)
        }
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 inset-x-0 z-40 transition-all duration-300',
          scrolled
            ? 'bg-bg/95 md:bg-bg/80 md:backdrop-blur-xl border-b border-app shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-[1500px] mx-auto px-4 lg:px-8 h-16 lg:h-20 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0 group">
            <div className="relative w-9 h-9 rounded-xl bg-gradient-neon flex items-center justify-center shadow-neon-sm group-hover:shadow-neon transition-shadow">
              <span className="font-display font-bold text-white text-lg">A</span>
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              Anime<span className="neon-text">Flux</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 ml-6">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-text bg-bg-card/60 shadow-inner'
                      : 'text-text-muted hover:text-text hover:bg-bg-card/40'
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1" />

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-card/40 border border-app hover:bg-bg-card/70 transition w-64 text-text-dim text-sm"
          >
            <Search size={16} />
            <span className="flex-1 text-left">Поиск аниме...</span>
            <kbd className="text-[10px] bg-bg-card/70 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-bg-card/40 border border-app hover:bg-bg-card/70"
            aria-label="Поиск"
          >
            <Search size={18} />
          </button>

          <ThemeToggle />

          {user ? (
            <>
              <Link
                to="/profile"
                className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-bg-card/40 border border-app hover:bg-bg-card/70"
                aria-label="Уведомления"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-neon-pink to-neon-purple text-[10px] font-bold text-white flex items-center justify-center shadow-neon-sm">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-bg-card/40 border border-app hover:bg-bg-card/70 transition"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-neon flex items-center justify-center text-sm font-bold text-white">
                      {(effectiveName || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="hidden sm:inline text-sm font-medium max-w-[120px] truncate">
                    {effectiveName}
                  </span>
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-60 glass-strong rounded-2xl p-2 z-50 animate-slide-up">
                      <MenuLink to="/profile" icon={User} label="Профиль" onClick={() => setUserMenuOpen(false)} />
                      <MenuLink to="/lists" icon={ListVideo} label="Мои списки" onClick={() => setUserMenuOpen(false)} />
                      <MenuLink to="/favorites" icon={Heart} label="Избранное" onClick={() => setUserMenuOpen(false)} />
                      <MenuLink to="/history" icon={History} label="История" onClick={() => setUserMenuOpen(false)} />
                      <div className="border-t border-app my-1" />
                      <button
                        onClick={async () => {
                          await logout()
                          setUserMenuOpen(false)
                          navigate('/')
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-bg-card/40 transition"
                      >
                        <LogOut size={16} /> Выйти
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/login" className="btn-ghost text-sm">Войти</Link>
              <Link to="/register" className="btn-primary text-sm">Регистрация</Link>
            </div>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-bg-card/40 border border-app"
            aria-label="Меню"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-app bg-bg animate-fade-in">
            <nav className="px-4 py-4 flex flex-col gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition',
                      isActive ? 'bg-bg-card/60 text-text' : 'text-text-muted hover:bg-bg-card/40'
                    )
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
              {!user && (
                <div className="flex gap-2 pt-3 border-t border-app mt-2">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1">Войти</Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary flex-1">Регистрация</Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function MenuLink({ to, icon: Icon, label, onClick }: any) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-bg-card/40 transition"
    >
      <Icon size={16} /> {label}
    </Link>
  )
}
