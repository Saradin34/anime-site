import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserPlus, Mail, Lock, User as UserIcon, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { isFirebaseConfigured } from '@/lib/firebase'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, loading, error, clearError } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signUp(email, password, name)
      navigate('/', { replace: true })
    } catch {}
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-neon flex items-center justify-center shadow-neon">
            <UserPlus size={28} className="text-white" />
          </div>
        </div>
        <h1 className="font-display text-3xl font-bold text-center mb-2">Создать аккаунт</h1>
        <p className="text-text-muted text-center mb-6">Это бесплатно и быстро</p>

        {!isFirebaseConfigured && (
          <div className="mb-4 p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/30 text-xs text-text-muted">
            ⚠️ Firebase не настроен — данные сохранятся локально в браузере.
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="relative">
            <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              required
              placeholder="Никнейм"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError() }}
              className="input pl-10"
            />
          </div>
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
              minLength={6}
              placeholder="Пароль (мин. 6 символов)"
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
            {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            Создать аккаунт
          </button>
        </form>

        <p className="text-center text-sm text-text-muted mt-6">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-neon-pink hover:text-neon-purple font-medium">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
