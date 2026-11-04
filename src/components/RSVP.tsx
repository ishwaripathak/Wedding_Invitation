import {useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {Check, Heart} from 'lucide-react';
import {Reveal, Ornament} from './Shared';
import {readStored, writeStored} from '../storage';
import {newSubmissionKey, sendRsvp, submissionsConfigured, submissionStorageKey} from '../submissions';
import type {GuestResponse, SubmissionKey} from '../submissions';
import {useLanguage} from '../i18n';
import type {MessageKey} from '../translations';
const key = submissionStorageKey('rsvp');
type Saved = SubmissionKey & {response: GuestResponse; submittedAt: string | null};
function validResponse(value: unknown): value is GuestResponse {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.name === 'string' && typeof v.email === 'string' && (v.attendance === 'yes' || v.attendance === 'no') && typeof v.guests === 'number' && typeof v.dietary === 'string';
}
function validSaved(value: unknown): value is Saved | null {
  if (value === null) return true;
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && /^[0-9a-f-]{36}$/i.test(v.id) && typeof v.token === 'string' && /^[a-f0-9]{64}$/i.test(v.token) && (v.submittedAt === null || (typeof v.submittedAt === 'string' && Number.isFinite(Date.parse(v.submittedAt)))) && validResponse(v.response);
}
export default function RSVP() {
  const {t} = useLanguage();
  const [initial] = useState(() => readStored<Saved | null>(key, null, validSaved));
  const pending = useRef<Saved | null>(initial);
  const inFlight = useRef(false);
  const [saved, setSaved] = useState(initial?.submittedAt ? initial.response : null);
  const [error, setError] = useState<MessageKey | null>(null);
  const [busy, setBusy] = useState<'yes' | 'no' | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || !event.currentTarget.reportValidity()) return;
    const button = (event.nativeEvent as SubmitEvent).submitter;
    const attendance = button instanceof HTMLButtonElement ? button.value : '';
    if (attendance !== 'yes' && attendance !== 'no') {setError('chooseAttendance'); return;}
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    if (name.length < 2) {setError('invalidName'); return;}
    // Keep the existing spreadsheet contract: Yes is one attendee; No is zero.
    // No email, guest-count or dietary fields are requested from the visitor.
    const response: GuestResponse = {name, attendance, email: '', guests: attendance === 'yes' ? 1 : 0, dietary: ''};
    inFlight.current = true; setBusy(attendance); setError(null);
    try {
      const identity = pending.current ?? newSubmissionKey();
      pending.current = {id: identity.id, token: identity.token, response, submittedAt: null};
      writeStored(key, pending.current);
      const receipt = await sendRsvp({...response, id: identity.id, token: identity.token, website: String(form.get('website') || '')});
      pending.current = {...pending.current, submittedAt: receipt.submittedAt};
      writeStored(key, pending.current);
      setSaved(response);
    } catch {setError('sendError');}
    finally {inFlight.current = false; setBusy(null);}
  }
  return <section id="rsvp" className="rsvp-section section-pad">
    <Reveal className="rsvp-intro"><p className="eyebrow gold">{t('presence')}</p><h2>{t('rsvpTitle')}<br/><em>{t('rsvpTitleEm')}</em></h2><Ornament light/><p>{t('rsvpIntro')}</p><p className="rsvp-note">{t('rsvpPrivate')}</p><Heart size={24} strokeWidth={1}/></Reveal>
    <Reveal className="rsvp-form-wrap">{saved ? <div className="rsvp-success" role="status"><Check size={36} strokeWidth={1}/><h3>{t(saved.attendance === 'yes' ? 'rsvpYesTitle' : 'rsvpNoTitle')}</h3><p>{saved.name}, {t('rsvpReceived')}</p><p>{t('savedChoice')}: <strong>{t(saved.attendance)}</strong></p></div> : <form onSubmit={submit} aria-busy={busy !== null}>
      <div className="form-trap" aria-hidden="true"><label>{t('empty')}<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <label className="field-label" htmlFor="rsvp-name">{t('name')}</label>
      <input id="rsvp-name" name="name" defaultValue={initial?.response.name} placeholder={t('name')} autoComplete="name" required minLength={2} maxLength={100} disabled={busy !== null}/>
      <fieldset className="rsvp-choice" disabled={busy !== null || !submissionsConfigured}>
        <legend>{t('rsvpQuestion')}</legend>
        <button className="primary-button" type="submit" name="attendance" value="yes">{t(busy === 'yes' ? 'sending' : 'yes')}</button>
        <button className="primary-button rsvp-no" type="submit" name="attendance" value="no">{t(busy === 'no' ? 'sending' : 'no')}</button>
      </fieldset>
      {error && <p className="form-error" role="alert">{t(error)}</p>}
      <p className="form-footnote">{t(submissionsConfigured ? 'rsvpPrivate' : 'repliesSoon')}</p>
    </form>}</Reveal>
  </section>;
}
