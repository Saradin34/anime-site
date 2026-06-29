import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { isFirebaseConfigured } from '@/lib/firebase'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from || '/'
  const { signIn, signInWithGoogle, loading, error, clearError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signIn(email, password)
      navigate(from, { replace: true })
    } catch {}
  }

  const google = async () => {
    try {
      await signInWithGoogle()
      navigate(from, { replace: true })
    } catch {}
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon">
            <LogIn size={28} className="text-white" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-center mb-2">С возвращением!</h1>
        <p className="text-text-muted text-center mb-6">Войдите в свой аккаунт</p>

        {!isFirebaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-xs text-text-muted">
            ⚠️ Firebase не настроен — используется локальная авторизация (данные хранятся в браузере).
            Добавьте ключи в <code>.env.local</code> для полноценной авторизации.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError() }}
              className="input pl-10"
            />
          </div>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="password"
              required
              placeholder="Пароль"
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError() }}
              className="input pl-10"
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
            Войти
          </button>
        </form>

        {isFirebaseConfigured && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-text-dim">
              <div className="flex-1 h-px bg-hover-strong" />
              или
              <div className="flex-1 h-px bg-hover-strong" />
            </div>
            <button onClick={google} disabled={loading} className="btn-ghost w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.5l3-3C17.4 1.7 14.9 1 12 1 7.4 1 3.4 3.6 1.5 7.5l3.5 2.7C6 7.2 8.8 5 12 5z"/>
                <path fill="#4285F4" d="M23 12c0-.8-.1-1.5-.2-2.2H12v4.5h6.2c-.3 1.5-1.1 2.7-2.4 3.5l3.5 2.7C21.7 18.5 23 15.5 23 12z"/>
                <path fill="#FBBC05" d="M5 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2L1.5 7.1C.5 8.7 0 10.3 0 12s.5 3.3 1.5 4.9L5 14.2z"/>
                <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.6l-3.5-2.7c-1 .6-2.2 1-3.7 1-3.2 0-6-2.2-7-5.3L1.5 16.9C3.4 20.5 7.4 23 12 23z"/>
              </svg>
              Войти через Google
            </button>
          </>
        )}

        <p className="text-center text-sm text-text-muted mt-6">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-neon-pink hover:text-neon-purple font-medium">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
