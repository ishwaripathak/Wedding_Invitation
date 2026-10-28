import {useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowUpRight, Check, Heart} from 'lucide-react';
import {Reveal, Ornament} from './Shared';
import {readStored, writeStored} from '../storage';
import {newSubmissionKey, sendRsvp, submissionsConfigured, submissionStorageKey} from '../submissions';
import type {GuestResponse, SubmissionKey} from '../submissions';
const key = submissionStorageKey('rsvp');
type Saved = SubmissionKey & { response: GuestResponse; submittedAt: string | null };
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
  const [initial] = useState(() => readStored<Saved | null>(key, null, validSaved));
  const pending = useRef<Saved | null>(initial);
  const [saved, setSaved] = useState(initial?.submittedAt ? initial.response : null);
  // Earlier browser-only responses are drafts, never proof of online receipt.
  const [draft, setDraft] = useState(() => initial?.response ?? readStored<Saved | null>('sagar-ishwari-rsvp-receipt-v1', null, validSaved)?.response ?? readStored<GuestResponse | null>('sagar-ishwari-rsvp', null, (v): v is GuestResponse | null => v === null || validResponse(v)));
  const [attendance, setAttendance] = useState<'yes' | 'no'>(draft?.attendance ?? 'yes');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [remembered, setRemembered] = useState(true);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !event.currentTarget.reportValidity()) return;
    const form = new FormData(event.currentTarget);
    const response: GuestResponse = { name: String(form.get('name') || '').trim(), email: String(form.get('email') || '').trim(), attendance, guests: attendance === 'yes' ? Number(form.get('guests')) : 0, dietary: attendance === 'yes' ? String(form.get('dietary') || '').trim() : '' };
    if (response.name.length < 2) { setError('Please enter your full name (at least two characters).'); return; }
    setBusy(true); setError('');
    try {
      const identity = pending.current ?? newSubmissionKey();
      pending.current = { id: identity.id, token: identity.token, response, submittedAt: null };
      writeStored(key, pending.current);
      const receipt = await sendRsvp({ ...response, id: identity.id, token: identity.token, website: String(form.get('website') || '') });
      pending.current = { ...pending.current, submittedAt: receipt.submittedAt };
      setRemembered(writeStored(key, pending.current));
      setSaved(response); setDraft(response);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to send. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section id="rsvp" className="rsvp-section section-pad">
    <Reveal className="rsvp-intro"><p className="eyebrow gold">YOUR PRESENCE IS OUR PRESENT</p><h2>Will you celebrate<br/><em>with us?</em></h2><Ornament light/><p>The day wouldn’t be the same without you.<br/>Let us know if you can join our celebration.</p><p className="rsvp-note">Your response will be shared privately<br/>with the wedding families.</p><Heart size={24} strokeWidth={1}/></Reveal>
    <Reveal className="rsvp-form-wrap">{saved ? <div className="rsvp-success" role="status"><Check size={36} strokeWidth={1}/><h3>{saved.attendance === 'yes' ? 'A seat full of love.' : 'You’ll be in our hearts.'}</h3><p>{saved.name}, {saved.attendance === 'yes' ? `your response for ${saved.guests} ${saved.guests === 1 ? 'guest' : 'guests'} has been received.` : 'your response has been received. Thank you for letting us know.'}</p><p className="small-copy">{remembered ? 'Thank you! You can update your response below.' : 'Your response is received, but this browser could not remember it. Please contact the families for changes after leaving this page.'}</p><button className="text-link light-link" onClick={() => { setDraft(saved); setAttendance(saved.attendance); setSaved(null); }}>EDIT MY RESPONSE <ArrowUpRight size={14}/></button></div> : <form onSubmit={submit} aria-busy={busy}>
      <div className="form-trap" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
      <fieldset className="attendance" disabled={busy}><legend>Can you make it?</legend><label className={attendance === 'yes' ? 'selected' : ''}><input type="radio" name="attendance" value="yes" checked={attendance === 'yes'} onChange={() => setAttendance('yes')}/>Joyfully accepts</label><label className={attendance === 'no' ? 'selected' : ''}><input type="radio" name="attendance" value="no" checked={attendance === 'no'} onChange={() => setAttendance('no')}/>Regretfully declines</label></fieldset>
      <label className="field-label" htmlFor="rsvp-name">FULL NAME <span>*</span></label><input id="rsvp-name" name="name" defaultValue={draft?.name} placeholder="Your name" autoComplete="name" required minLength={2} maxLength={100} disabled={busy}/>
      <label className="field-label" htmlFor="rsvp-email">EMAIL ADDRESS <span>*</span></label><input id="rsvp-email" name="email" defaultValue={draft?.email} type="email" placeholder="you@example.com" autoComplete="email" required maxLength={200} disabled={busy}/>
      {attendance === 'yes' && <><label className="field-label" htmlFor="rsvp-guests">NUMBER OF GUESTS, INCLUDING YOU <span>*</span></label><select id="rsvp-guests" name="guests" defaultValue={draft?.guests || 1} required disabled={busy}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select><label className="field-label" htmlFor="rsvp-dietary">DIETARY REQUIREMENTS <span>(OPTIONAL)</span></label><input id="rsvp-dietary" name="dietary" defaultValue={draft?.dietary} placeholder="Anything we should know?" maxLength={300} disabled={busy}/></>}
      {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={busy || !submissionsConfigured}>{busy ? 'SENDING YOUR RESPONSE…' : 'SEND MY RESPONSE'} <ArrowUpRight size={17}/></button><p className="form-footnote">{submissionsConfigured ? "Your details are shared only with the wedding families." : "Online replies will open soon. Please contact the wedding families directly for now."}</p>
    </form>}</Reveal>
  </section>;
}
