// Блок с социальными ссылками + редактирование.

import { useState } from 'react'
import { Globe, MessageSquare, Send as TelegramIcon, X, Pencil, Check } from 'lucide-react'
import type { SocialLinks } from '@/types/anime'

const LINK_DEFS: { key: keyof SocialLinks; label: string; icon: JSX.Element; placeholder: string; format?: (v: string) => string }[] = [
  { key: 'discord',   label: 'Discord',  icon: <MessageSquare size={14} />, placeholder: 'username#0000 или ссылка' },
  { key: 'telegram',  label: 'Telegram', icon: <TelegramIcon size={14} />,  placeholder: '@username', format: (v) => v.startsWith('@') ? `https://t.me/${v.slice(1)}` : v },
  { key: 'twitter',   label: 'Twitter/X', icon: <X size={14} />,             placeholder: '@username', format: (v) => v.startsWith('@') ? `https://x.com/${v.slice(1)}` : v },
  { key: 'vk',        label: 'VK',       icon: <Globe size={14} />,         placeholder: 'vk.com/username' },
  { key: 'mal',       label: 'MAL',      icon: <Globe size={14} />,         placeholder: 'myanimelist.net/profile/username' },
  { key: 'shikimori', label: 'Shikimori',icon: <Globe size={14} />,         placeholder: 'shikimori.one/username' },
  { key: 'website',   label: 'Сайт',     icon: <Globe size={14} />,         placeholder: 'https://...' },
]

interface Props {
  value: SocialLinks
  editable?: boolean
  onChange?: (next: SocialLinks) => void
}

function normalizeUrl(url: string): string {
  if (!url) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

export default function SocialLinksBlock({ value, editable, onChange }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<SocialLinks>(value)

  const startEdit = () => { setDraft(value); setEditing(true) }
  const save = () => {
    // Очищаем пустые
    const cleaned: SocialLinks = {}
    for (const k in draft) {
      const v = (draft as any)[k]?.trim()
      if (v) (cleaned as any)[k] = v
    }
    onChange?.(cleaned)
    setEditing(false)
  }

  const filled = LINK_DEFS.filter((d) => value[d.key])

  if (!editing && filled.length === 0 && !editable) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          🔗 Социальные ссылки
        </h3>
        {editable && !editing && (
          <button onClick={startEdit} className="text-text-muted hover:text-text text-sm flex items-center gap-1">
            <Pencil size={12} /> Изменить
          </button>
        )}
      </div>

      {editing ? (
        <div className="glass rounded-2xl p-4 space-y-2">
          {LINK_DEFS.map((d) => (
            <div key={d.key} className="flex items-center gap-2">
              <div className="w-24 text-xs text-text-muted flex items-center gap-1.5 shrink-0">
                {d.icon} {d.label}
              </div>
              <input
                value={(draft[d.key] as string) || ''}
                onChange={(e) => setDraft((s) => ({ ...s, [d.key]: e.target.value }))}
                placeholder={d.placeholder}
                className="input flex-1 py-1.5 text-sm"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1 text-sm">Отмена</button>
            <button onClick={save} className="btn-primary flex-1 text-sm">
              <Check size={14} /> Сохранить
            </button>
          </div>
        </div>
      ) : filled.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {filled.map((d) => {
            const raw = value[d.key] as string
            const url = d.format ? d.format(raw) : normalizeUrl(raw)
            return (
              <a
                key={d.key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="chip hover:bg-hover-strong transition"
                title={raw}
              >
                {d.icon} {d.label}
              </a>
            )
          })}
        </div>
      ) : (
        <div className="glass rounded-2xl p-4 text-sm text-text-muted text-center">
          Соц.сетей пока нет. {editable && 'Добавьте через «Изменить».'}
        </div>
      )}
    </section>
  )
}
