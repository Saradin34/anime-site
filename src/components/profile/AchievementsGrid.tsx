import clsx from 'clsx';
import { ACHIEVEMENTS, TIER_STYLES, type Achievement } from '@/lib/achievements';
import type { UnlockedAchievement } from '@/types/anime';
export default function AchievementsGrid({unlocked=[]}:{unlocked?:UnlockedAchievement[]}){ return <div className="grid">{ACHIEVEMENTS.map((a:Achievement)=><div key={a.id} className={clsx('info-card',TIER_STYLES[a.tier||'bronze'])}>{a.title}</div>)}</div>; }
