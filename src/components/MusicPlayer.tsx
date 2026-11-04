import {useLanguage} from '../i18n';
import {useRef,useState} from 'react';
import {Music2,VolumeX} from 'lucide-react';
import {weddingData as d} from '../data/weddingData';
export default function MusicPlayer(){const {t}=useLanguage();const ref=useRef<HTMLAudioElement>(null);const[playing,setPlaying]=useState(false);const[error,setError]=useState('');if(!d.musicUrl)return null;async function toggle(){if(!ref.current)return;if(playing){ref.current.pause();setPlaying(false)}else{try{await ref.current.play();setPlaying(true);setError('')}catch{setError('musicError')}}}return <><audio ref={ref} src={d.musicUrl} loop preload="none" onError={()=>{setError('musicError');setPlaying(false)}}/><button className="music-button" aria-label={t(playing?'musicPause':'musicPlay')} aria-pressed={playing} onClick={toggle}>{playing?<Music2 size={18}/>:<VolumeX size={18}/>}</button>{error&&<span className="music-error" role="status">{t('musicError')}</span>}</>}
