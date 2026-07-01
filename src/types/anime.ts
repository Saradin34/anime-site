export type SourceName = 'anilibria' | 'jikan' | 'local';

export interface Episode {
  id: string;
  number: number;
  title: string;
  preview?: string;
  hls?: {
    sd?: string;
    hd?: string;
    fhd?: string;
  };
  embedUrl?: string;
}

export interface Anime {
  id: string;
  code?: string;
  source: SourceName;
  title: string;
  englishTitle?: string;
  poster: string;
  banner?: string;
  description: string;
  genres: string[];
  year?: number;
  status?: string;
  type?: string;
  rating?: number;
  episodesCount?: number;
  episodes: Episode[];
  updatedAt?: number;
}

export interface User {
  email: string;
  name: string;
}
