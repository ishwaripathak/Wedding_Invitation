import Carousel from './Carousel';
import {Reveal,Ornament} from './Shared';
import {useLanguage,useWeddingData} from '../i18n';
export default function Couple(){const d=useWeddingData();const {t}=useLanguage();return <section id="our-story" className="couple section-pad"><Reveal className="story-copy"><p className="eyebrow gold">{t('storyEyebrow')}</p><h2>{t('destiny')}<br/><em>{t('lotOfLove')}</em></h2><Ornament/><p>{d.story}</p><p className="story-signature">{d.groom} <span>&</span> {d.bride}</p><span className="eyebrow gold">{t('chapter')}</span></Reveal><Reveal><Carousel/></Reveal></section>}
