import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { weddingData as d } from '../data/weddingData';
export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const {scrollYProgress} = useScroll({target: ref, offset: ['start start', 'end start']});
  const scale = useTransform(scrollYProgress, [0, .65], [1, 1.65]);
  const left = useTransform(scrollYProgress, [.12, .8], ['0%', '-44%']);
  const right = useTransform(scrollYProgress, [.12, .8], ['0%', '44%']);
  const opacity = useTransform(scrollYProgress, [.25, .9], [1, 0]);
  const textOpacity = useTransform(scrollYProgress, [0, .35], [1, 0]);
  const glow = useTransform(scrollYProgress, [0, .35, .85], [0, .9, 0]);
  const artwork = d.templeArtwork || `${import.meta.env.BASE_URL}temple.svg`;
  return <section ref={ref} className="hero" aria-labelledby="hero-title">
    <div className="hero-grain"/>
    <nav className="hero-nav" aria-label="Main navigation"><a href="#" className="monogram" aria-label="Sagar and Ishwari home">S<span>&</span>I</a><a href="#rsvp" className="hero-rsvp">WE SAVED YOU A SEAT <ArrowUpRight size={13}/></a></nav>
    <motion.div className="hero-heading" style={{opacity: reduced ? 1 : textOpacity}}>
      <p className="eyebrow">A celebration of love</p>
      <h1 id="hero-title"><span>{d.groomFull}</span><em>weds</em><span>{d.brideFull}</span></h1>
      <p className="hero-date">{d.dateParts.day} <span>{d.dateParts.month.toUpperCase()}</span> {d.dateParts.year}</p>
      <div className="hero-flourish" aria-hidden="true">✧</div>
    </motion.div>
    <motion.div className="temple-scene" style={{scale: reduced ? 1 : scale, opacity: reduced ? 1 : opacity}}>
      <motion.div className="portal-glow" style={{opacity: reduced ? 0 : glow}} />
      <motion.img src={artwork} alt="An ornate ivory and gold wedding mandap with three domes, marigold garlands, and hanging bells" className="temple temple-left" style={{x: reduced ? 0 : left}}/>
      <motion.img src={artwork} alt="" aria-hidden="true" className="temple temple-right" style={{x: reduced ? 0 : right}}/>
    </motion.div>
    <a className="scroll-cue" href="#invitation"><span>SCROLL TO EXPLORE</span><ArrowDown size={15}/></a>
    <div className="hero-bottom"/>
  </section>;
}
