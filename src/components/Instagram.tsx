import {Instagram as InstagramIcon,ArrowUpRight} from 'lucide-react';
import {useLanguage,useWeddingData} from '../i18n';
import {Reveal} from './Shared';
export default function Instagram(){const d=useWeddingData();const {t}=useLanguage();return <section className="instagram section-pad"><Reveal><InstagramIcon size={25} strokeWidth={1}/><p className="eyebrow gold">{t('capture')}</p><h2>{t('memoryTitle')}</h2><p>{t('shareMoments')}</p><a href={`${d.instagramUrl}explore/tags/${d.hashtag.slice(1).toLowerCase()}/`} target="_blank" rel="noreferrer" className="hashtag">{d.hashtag}<ArrowUpRight size={22}/></a></Reveal></section>}
