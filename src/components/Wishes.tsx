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
  const [wishes, setWishes] = useState(() => readStored<Wish[]>(key, [], validWishes));
  const [status, setStatus] = useState('');
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
    if (name.length < 2 || message.length < 5) { setFailed(true); setStatus('Please add your name and a wish of at least five characters.'); return; }
    setBusy(true); setStatus(''); setFailed(false);
    try {
      // Retrying an interrupted request with the same content cannot add a duplicate row.
      if (!pending.current || pending.current.name !== name || pending.current.message !== message) pending.current = { ...newSubmissionKey(), name, message };
      const receipt = await sendMessage({ ...pending.current, website: String(data.get('website') || '') });
      const next = [{ id: receipt.id, name, message }, ...wishes.filter(w => w.id !== receipt.id)].slice(0,100);
      writeStored(key, next); setWishes(next); pending.current = null; form.reset();
      setStatus('Your lovely wish has been received by the wedding families. Thank you!');
    } catch (error) { setFailed(true); setStatus(error instanceof Error ? error.message : 'Unable to send. Please try again.'); }
    finally { setBusy(false); }
  }
  return <section className="wishes section-pad"><Reveal><p className="eyebrow gold">WORDS WE’LL TREASURE</p><h2>Leave a little love.</h2><p className="muted">Your blessings are the most beautiful gift.</p></Reveal><div className="wishes-layout"><form onSubmit={submit} aria-busy={busy}>
    <div className="form-trap" aria-hidden="true"><label>Leave this empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label htmlFor="wish-name" className="field-label">YOUR NAME</label><input id="wish-name" name="name" placeholder="With love, from…" required minLength={2} maxLength={80} disabled={busy}/><label htmlFor="wish-message" className="field-label">YOUR WISHES</label><textarea id="wish-message" name="message" placeholder="A blessing, a memory, a little advice…" required minLength={5} maxLength={600} rows={4} disabled={busy}/><button className="primary-button maroon-button" type="submit" disabled={busy || !submissionsConfigured}>{busy ? 'SENDING YOUR WISH…' : 'SEND A LITTLE LOVE'} <ArrowUpRight size={16}/></button><p className="form-footnote">{submissionsConfigured ? "Your message is sent privately to the wedding families." : "Online messages will open soon. Please contact the wedding families directly for now."}</p><p className="storage-status" role={failed ? 'alert' : 'status'}>{status}</p>
    </form><div className="wish-wall" aria-label="Your sent wishes on this device">{wishes.length ? wishes.map(w => <article className="wish-card" key={w.id}><Heart size={17} strokeWidth={1}/><p>“{w.message}”</p><footer>— {w.name}<span>Sent with love</span></footer></article>) : <div className="wish-empty"><Heart size={28} strokeWidth={1}/><p>A little note.<br/><em>A lifetime of love.</em></p><span>YOUR SENT WISHES WILL APPEAR HERE</span></div>}</div></div></section>;
}
