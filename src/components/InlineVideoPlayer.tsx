import {useRef, useState} from 'react';
import {Pause, Play, Volume2, VolumeX} from 'lucide-react';
import {useLanguage} from '../i18n';

function clock(seconds: number) {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return Math.floor(whole / 60) + ':' + String(whole % 60).padStart(2, '0');
}

export default function InlineVideoPlayer({src, poster}: {src: string; poster?: string}) {
  const {t} = useLanguage();
  const video = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [muted, setMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [failed, setFailed] = useState(false);
  async function togglePlayback() {
    const media = video.current;
    if (!media || busy) return;
    if (!media.paused) {media.pause(); return;}
    setFailed(false); setBusy(true);
    try {
      if (media.error) media.load();
      await media.play();
    } catch {setFailed(true);}
    finally {setBusy(false);}
  }
  function readDuration() {
    const value = video.current?.duration ?? 0;
    setDuration(Number.isFinite(value) && value > 0 ? value : 0);
  }
  return <div className="local-film">
    <div className="video-frame local-film-frame">
      <video ref={video} src={src} poster={poster} controls={false} playsInline preload="metadata" aria-label={t('filmAlt')}
        onLoadedMetadata={readDuration} onDurationChange={readDuration}
        onPlaying={() => {setPlaying(true); setBusy(false);}}
        onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)}
        onTimeUpdate={() => setPosition(video.current?.currentTime ?? 0)}
        onVolumeChange={() => setMuted(Boolean(video.current?.muted || video.current?.volume === 0))}
        onError={() => {setFailed(true); setBusy(false); setPlaying(false);}}/>
    </div>
    <div className="film-controls" role="group" aria-label={t('filmControls')}>
      <button className="film-control" type="button" aria-label={t(playing ? 'filmPause' : 'filmPlay')} title={t(playing ? 'filmPause' : 'filmPlay')} onClick={togglePlayback} disabled={busy}>
        {playing ? <Pause size={24} aria-hidden="true"/> : <Play size={24} aria-hidden="true"/>}
      </button>
      <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(position, duration)} disabled={!duration}
        aria-label={t('filmSeek')} aria-valuetext={clock(position) + ' / ' + clock(duration)}
        onChange={event => {if (video.current && duration) {video.current.currentTime = Number(event.currentTarget.value); setPosition(video.current.currentTime);}}}/>
      <button className="film-control" type="button" aria-label={t(muted ? 'filmUnmute' : 'filmMute')} title={t(muted ? 'filmUnmute' : 'filmMute')} aria-pressed={muted}
        onClick={() => {if (video.current) video.current.muted = !video.current.muted;}}>
        {muted ? <VolumeX size={24} aria-hidden="true"/> : <Volume2 size={24} aria-hidden="true"/>}
      </button>
      <span className="film-clock" aria-hidden="true">{clock(position)} / {clock(duration)}</span>
    </div>
    {failed && <p className="film-error" role="alert">{t('filmError')}</p>}
  </div>;
}
