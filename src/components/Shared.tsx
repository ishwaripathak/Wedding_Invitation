import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';
export function Reveal({children, className = ''}: {children: ReactNode; className?: string}) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? {} : {opacity: [.75, 1], y: [16, 0]}} viewport={{once: true, amount: 0.12}} transition={{duration: .75}}>{children}</motion.div>;
}
export function Ornament({light = false}: {light?: boolean}) {return <div className={`ornament ${light ? 'light' : ''}`} aria-hidden="true"><span/>✧<span/></div>}
export function Lotus({className = ''}: {className?: string}) {return <svg viewBox="0 0 120 90" fill="none" className={className} aria-hidden="true"><g stroke="currentColor" strokeWidth="1.2"><path d="M60 74Q30 51 60 8Q90 51 60 74Z"/><path d="M60 74Q15 71 14 28Q50 33 60 74ZM60 74Q105 71 106 28Q70 33 60 74Z"/><path d="M60 74Q12 88 2 53Q32 49 60 74ZM60 74Q108 88 118 53Q88 49 60 74Z"/><path d="M27 83Q60 71 93 83"/></g></svg>}
export function Ganesh() {return <svg className="ganesh" viewBox="0 0 100 110" fill="none" role="img" aria-label="Lord Ganesha motif"><g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"><path d="M35 32Q50 14 65 32L62 42H38Z M40 25L50 9 60 25M50 4V0M37 43Q50 34 63 43Q68 58 57 67Q47 72 49 86Q52 95 61 85M39 46Q13 28 17 55Q20 73 38 67M62 46Q88 28 83 55Q80 73 64 67M38 57L43 61M62 57L58 61M38 76Q21 76 23 91L42 96M66 76Q80 76 77 91L59 98M22 100Q50 110 78 100"/><circle cx="44" cy="49" r="1" fill="currentColor"/><circle cx="57" cy="49" r="1" fill="currentColor"/></g></svg>}
