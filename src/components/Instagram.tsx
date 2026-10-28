import {Instagram as InstagramIcon,ArrowUpRight} from 'lucide-react';
import {weddingData as d} from '../data/weddingData';
import {Reveal} from './Shared';
export default function Instagram(){return <section className="instagram section-pad"><Reveal><InstagramIcon size={25} strokeWidth={1}/><p className="eyebrow gold">CAPTURE THE LOVE</p><h2>Every moment, a memory.</h2><p>Seeing our celebration through your eyes will mean the world.<br/>Share your little moments with</p><a href={`${d.instagramUrl}explore/tags/${d.hashtag.slice(1).toLowerCase()}/`} target="_blank" rel="noreferrer" className="hashtag">{d.hashtag}<ArrowUpRight size={22}/></a></Reveal></section>}
