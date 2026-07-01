export type SourceName = 'anilibria' | 'jikan' | 'local';
export interface Episode { id: string; number: number; title: string; preview?: string; hls?: { sd?: string; hd?: string; fhd?: string }; embedUrl?: string; duration?: string | number; }
export interface Genre { id?: number | string; name: string; }
export interface ReleaseShort { id: string | number; code?: string; alias?: string; source?: SourceName | string; title?: string; name?: { main?: string; english?: string }; names?: { ru?: string; en?: string }; poster?: string; posterUrl?: string; image?: string; year?: number; type?: { description?: string; string?: string } | string; genres?: Genre[]; description?: string; episodes?: Episode[]; rating?: number; }
export interface Release extends ReleaseShort { episodes_total?: number; status?: string; }
export interface Anime { id: string; code?: string; source: SourceName; title: string; englishTitle?: string; poster: string; banner?: string; description: string; genres: string[]; year?: number; status?: string; type?: string; rating?: number; episodesCount?: number; episodes: Episode[]; updatedAt?: number; }
export interface User { email: string; name: string; }
export interface SocialLinks { telegram?: string; vk?: string; discord?: string; shikimori?: string; website?: string; [key: string]: string | undefined; }
export interface UnlockedAchievement { id: string; unlockedAt: number; tier?: string; }
export interface NotificationItem { id: string; title: string; text?: string; read?: boolean; createdAt?: number; }
export interface UserProfile { uid: string; email?: string; name?: string; avatar?: string; cover?: string; bio?: string; favorites?: Array<string | number>; history?: Array<string | number>; lists?: Record<string, Array<string | number>>; socialLinks?: SocialLinks; achievements?: UnlockedAchievement[]; }
