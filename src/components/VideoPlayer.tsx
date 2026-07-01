import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type Props = { src?: string; embedUrl?: string; poster?: string; title?: string };
export function VideoPlayer({ src, embedUrl, poster, title }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || !src) return;
    if (video.canPlayType('application/vnd.apple.mpegurl')) video.src = src;
    else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src); hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [src]);

  const enterMobileFullscreen = async () => {
    const video = ref.current as (HTMLVideoElement & { webkitEnterFullscreen?: () => void }) | null;
    if (!video) return;

    const isPhone = window.matchMedia('(max-width: 760px), (pointer: coarse)').matches;
    if (!isPhone) return;

    try {
      if (video.requestFullscreen && !document.fullscreenElement) {
        await video.requestFullscreen();
      } else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      }
    } catch {
      // Некоторые мобильные браузеры разрешают fullscreen только через системную кнопку плеера.
    }
  };

  if (embedUrl) return <iframe className="video-frame" src={embedUrl} title={title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />;
  if (!src) return <div className="video-empty">Видео для этой серии пока недоступно</div>;
  return <video ref={ref} className="video-frame" poster={poster} controls playsInline onPlay={enterMobileFullscreen} />;
}
