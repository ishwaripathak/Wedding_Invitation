import {useLanguage,useWeddingData} from '../i18n';
import {Lotus,Ornament} from './Shared';
import {ArrowUp} from 'lucide-react';
export default function Footer(){const d=useWeddingData();const {t}=useLanguage();return <footer className="closing section-pad"><Lotus/><p className="eyebrow gold">{t('footerEyebrow')}</p><h2>{t('seeYou')}<br/><em>{t('ourForever')}</em></h2><p className="footer-names">{d.groom} <span>&</span> {d.bride}</p><Ornament/><p className="footer-date">{d.dateLabel.toUpperCase()}</p><p className="footer-note">{t('madeLove')}</p><a href="#top" className="back-top" aria-label={t('backTop')}><ArrowUp size={16}/></a></footer>}
