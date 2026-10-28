import {weddingData as d} from '../data/weddingData';
import {Lotus,Ornament} from './Shared';
import {ArrowUp} from 'lucide-react';
export default function Footer(){return <footer className="closing section-pad"><Lotus/><p className="eyebrow gold">WITH FULL HEARTS & OPEN ARMS</p><h2>See you at<br/><em>our forever.</em></h2><p className="footer-names">{d.groom} <span>&</span> {d.bride}</p><Ornament/><p className="footer-date">{d.dateLabel.toUpperCase()}</p><p className="footer-note">Made with love. Celebrated with you.</p><a href="#top" className="back-top" aria-label="Back to top"><ArrowUp size={16}/></a></footer>}
