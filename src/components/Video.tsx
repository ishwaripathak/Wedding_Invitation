import {useState} from 'react';
import InlineVideoPlayer from './InlineVideoPlayer';
import {Play} from 'lucide-react';
import {useLanguage, useWeddingData} from '../i18n';
import {Reveal, Lotus} from './Shared';

export default function Video() {
  const d = useWeddingData();
  const {t} = useLanguage();
  const [playing, setPlaying] = useState(false);
  const driveUrl = d.driveVideoId ? `https://drive.google.com/file/d/${encodeURIComponent(d.driveVideoId)}` : '';
  return <section className="video-section section-pad"><Reveal>
    <p className="eyebrow gold">{t('filmEyebrow')}</p><h2>{t('filmTitle')}</h2>
    {d.filmUrl ? <InlineVideoPlayer key={d.filmUrl} src={d.filmUrl} poster={d.filmPoster || undefined}/> : <div className="video-frame">
      {driveUrl ? <iframe src={`${driveUrl}/preview`} title={t('filmAlt')} loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen/>
        : playing && d.youtubeId ? <iframe src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(d.youtubeId)}?autoplay=1`} title={t('filmAlt')} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>
        : <div className="video-poster"><Lotus/><p className="video-script">{t('filmBeginning')}</p>
          {d.youtubeId ? <button className="play-button" aria-label={t('filmPlay')} onClick={() => setPlaying(true)}><Play size={22} fill="currentColor"/></button> : <span className="film-coming">{t('filmSoon')}</span>}
          <span className="video-initials">{d.groom.toUpperCase()} & {d.bride.toUpperCase()}</span>
        </div>}
    </div>}
    <p className="small-copy muted">{t('filmNote')}</p>
  </Reveal></section>;
}
