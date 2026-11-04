import {useLanguage, useWeddingData} from '../i18n';
import {Ornament, Reveal} from './Shared';

export default function Functions() {
  const d = useWeddingData();
  const {t} = useLanguage();
  return <section id="celebrations" className="functions section-pad">
    <Reveal><p className="eyebrow gold">{t('eventsEyebrow')}</p><h2>{t('eventsTitle')}</h2><Ornament light/></Reveal>
    <div className="event-grid simple-events">
      {d.events.map(event => <Reveal key={event.name} className="event-card">
        <h3>{event.name}</h3>
        <p className="eyebrow event-date">{event.date}</p>
        <p className="event-time">{event.time} <span>{d.dateParts.timezone}</span></p>
      </Reveal>)}
    </div>
  </section>;
}
