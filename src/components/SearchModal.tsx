import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { animeApi, posterUrl } from '@/api/anilibria'
import type { ReleaseShort } from '@/types/anime'

export default function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<ReleaseShort[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else { setQ(''); setResults([]) }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!q.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await animeApi.search(q, 8)
        setResults(res)
      } catch {
        setResults([])
      } finally { setLoading(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [q])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-bg/80 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="max-w-2xl mt-20 mx-auto px-4">
        <div className="glass-strong rounded-2xl overflow-hidden animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (q.trim()) {
                navigate(`/catalog?q=${encodeURIComponent(q)}`)
                onClose()
              }
            }}
            className="flex items-center gap-3 px-5 py-4 border-b border-app"
          >
            <Search size={20} className="text-text-muted" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск аниме по названию..."
              className="flex-1 bg-transparent outline-none text-base"
            />
            <button type="button" onClick={onClose} className="text-text-muted hover:text-text">
              <X size={20} />
            </button>
          </form>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading && <div className="p-8 text-center text-text-muted text-sm">Поиск...</div>}
            {!loading && q && results.length === 0 && (
              <div className="p-8 text-center text-text-muted text-sm">Ничего не найдено</div>
            )}
            {!loading && !q && (
              <div className="p-8 text-center text-text-dim text-sm">Начните вводить название аниме</div>
            )}
            {results.map((r) => (
              <Link
                key={r.id}
                to={`/anime/${r.alias}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-3 hover:bg-hover transition group"
              >
                <img src={posterUrl(r.poster)} alt="" className="w-12 h-16 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate group-hover:text-neon-pink transition">{r.name.main}</div>
                  <div className="text-xs text-text-dim truncate">{r.name.english}</div>
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {r.year} • {r.type?.description} • {r.genres?.slice(0, 2).map(g => g.name).join(', ')}
                  </div>
                </div>
                <ArrowRight size={16} className="text-text-dim group-hover:text-text transition" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
