import Carousel from './Carousel';
import {Reveal,Ornament} from './Shared';
import {weddingData as d} from '../data/weddingData';
export default function Couple(){return <section id="our-story" className="couple section-pad"><Reveal className="story-copy"><p className="eyebrow gold">WRITTEN IN THE STARS</p><h2>A little destiny.<br/><em>A lot of love.</em></h2><Ornament/><p>{d.story}</p><p className="story-signature">{d.groom} <span>&</span> {d.bride}</p><span className="eyebrow gold">OUR FAVOURITE CHAPTER, YET.</span></Reveal><Reveal><Carousel/></Reveal></section>}
