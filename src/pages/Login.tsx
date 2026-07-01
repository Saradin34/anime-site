import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { user, login, register } = useAuth(); const nav = useNavigate(); const [mode, setMode] = useState<'login'|'register'>('login'); const [email, setEmail] = useState('demo@anime.local'); const [password, setPassword] = useState('password'); const [name, setName] = useState('Anime Fan');
  if (user) return <Navigate to="/" />;
  async function submit(e: React.FormEvent) { e.preventDefault(); mode === 'login' ? await login(email, password) : await register(name, email, password); nav('/favorites'); }
  return <div className="auth-page"><form className="auth-card" onSubmit={submit}><span className="eyebrow">личный кабинет</span><h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1><p>Демо-авторизация хранит профиль в localStorage. Для production подключается Supabase/Firebase/Netlify Identity.</p>{mode === 'register' && <label>Имя<input value={name} onChange={(e) => setName(e.target.value)} required /></label>}<label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></label><label>Пароль<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></label><button className="primary-btn">{mode === 'login' ? 'Войти' : 'Создать аккаунт'}</button><button type="button" className="text-btn" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Нет аккаунта? Регистрация' : 'Уже есть аккаунт? Войти'}</button></form></div>;
}
