import {useLanguage} from '../i18n';
import type {MessageKey} from '../translations';
import {useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowUpRight, Heart} from 'lucide-react';
import {Reveal} from './Shared';
import {readStored, writeStored} from '../storage';
import {newSubmissionKey, sendMessage, submissionsConfigured, submissionStorageKey} from '../submissions';
import type {Message, SubmissionKey} from '../submissions';
type Wish = Message & { id: string };
const key = submissionStorageKey('sent-wishes');
function validWishes(value: unknown): value is Wish[] {
  return Array.isArray(value) && value.every(w => w && typeof w.id === 'string' && typeof w.name === 'string' && typeof w.message === 'string');
}
export default function Wishes() {
  const {t}=useLanguage();
  const [wishes, setWishes] = useState(() => readStored<Wish[]>(key, [], validWishes));
  const [status, setStatus] = useState<MessageKey | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const pending = useRef<(SubmissionKey & Message) | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy || !form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const message = String(data.get('message') || '').trim();
    if (name.length < 2 || message.length < 5) { setFailed(true); setStatus('wishInvalid'); return; }
    setBusy(true); setStatus(null); setFailed(false);
    try {
      // Retrying an interrupted request with the same content cannot add a duplicate row.
      if (!pending.current || pending.current.name !== name || pending.current.message !== message) pending.current = { ...newSubmissionKey(), name, message };
      const receipt = await sendMessage({ ...pending.current, website: String(data.get('website') || '') });
      const next = [{ id: receipt.id, name, message }, ...wishes.filter(w => w.id !== receipt.id)].slice(0,100);
      writeStored(key, next); setWishes(next); pending.current = null; form.reset();
      setStatus('wishReceived');
    } catch { setFailed(true); setStatus('sendError'); }
    finally { setBusy(false); }
  }
  return <section className="wishes section-pad"><Reveal><p className="eyebrow gold">{t('wishEyebrow')}</p><h2>{t('wishTitle')}</h2><p className="muted">{t('wishIntro')}</p></Reveal><div className="wishes-layout"><form onSubmit={submit} aria-busy={busy}>
    <div className="form-trap" aria-hidden="true"><label>{t('empty')}<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label htmlFor="wish-name" className="field-label">{t('name')}</label><input id="wish-name" name="name" placeholder={t('wishNamePlaceholder')} required minLength={2} maxLength={80} disabled={busy}/><label htmlFor="wish-message" className="field-label">{t('wishes')}</label><textarea id="wish-message" name="message" placeholder={t('wishPlaceholder')} required minLength={5} maxLength={600} rows={4} disabled={busy}/><button className="primary-button maroon-button" type="submit" disabled={busy || !submissionsConfigured}>{t(busy?'wishSending':'wishSend')} <ArrowUpRight size={16}/></button><p className="form-footnote">{t(submissionsConfigured?'wishPrivate':'repliesSoon')}</p><p className="storage-status" role={failed ? 'alert' : 'status'}>{status&&t(status)}</p>
    </form><div className="wish-wall" aria-label={t('sentWishes')}>{wishes.length ? wishes.map(w => <article className="wish-card" key={w.id}><Heart size={17} strokeWidth={1}/><p>“{w.message}”</p><footer>— {w.name}<span>{t('sentLove')}</span></footer></article>) : <div className="wish-empty"><Heart size={28} strokeWidth={1}/><p>{t('littleNote')}<br/><em>{t('lifetimeLove')}</em></p><span>{t('wishesAppear')}</span></div>}</div></div></section>;
}
