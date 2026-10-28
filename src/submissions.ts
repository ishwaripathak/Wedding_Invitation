export type GuestResponse = { name: string; email: string; attendance: 'yes' | 'no'; guests: number; dietary: string };
export type Message = { name: string; message: string };
export type SubmissionKey = { id: string; token: string };
export type Receipt = { id: string; submittedAt: string };
const endpoint = (import.meta.env.VITE_GOOGLE_SHEETS_URL || '').trim();
export const submissionsConfigured = /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(endpoint);
// Separate receipts from the former Excel receiver and from other script deployments.
export const submissionStorageKey = (name: string) => `sagar-ishwari-sheets-${name}-${endpoint.match(/\/s\/([^/]+)\/exec$/)?.[1] || 'unconfigured'}`;
export function newSubmissionKey(): SubmissionKey {
  return { id: crypto.randomUUID(), token: Array.from(crypto.getRandomValues(new Uint8Array(32)), n => n.toString(16).padStart(2, '0')).join('') };
}
export async function sendToSheets(action: 'rsvp' | 'message', data: SubmissionKey & object): Promise<Receipt> {
  if (!submissionsConfigured) throw new Error('Online replies will open soon. Please contact the wedding families directly for now.');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 35000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST', mode: 'cors', redirect: 'follow', credentials: 'omit',
      // Apps Script does not implement OPTIONS: send a CORS-safelisted content type.
      // The body is still JSON and is parsed from e.postData.contents by Code.gs.
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify({ ...data, action }), signal: controller.signal,
    });
    let result: unknown;
    try { result = await response.json(); }
    catch { throw new Error('Your response could not be confirmed. Please try again or contact the families.'); }
    if (!response.ok) throw new Error('We couldn’t confirm your response. Please try again; your form has been kept.');
    if (!result || typeof result !== 'object') throw new Error('Your response could not be confirmed. Please try again.');
    if ('ok' in result && result.ok === false && 'error' in result && typeof result.error === 'string') throw new Error(result.error);
    if (!('ok' in result) || result.ok !== true || !('id' in result) || result.id !== data.id || !('submittedAt' in result) || typeof result.submittedAt !== 'string' || !Number.isFinite(Date.parse(result.submittedAt))) throw new Error('Your response could not be confirmed. Please try again.');
    return { id: data.id, submittedAt: result.submittedAt };
  } catch (error) {
    if (error instanceof TypeError || (error instanceof Error && error.name === 'AbortError')) throw new Error('We couldn’t confirm your response. Please try again; your form has been kept.');
    throw error;
  } finally { clearTimeout(timeout); }
}
export const sendRsvp = (data: GuestResponse & SubmissionKey & { website: string }) => sendToSheets('rsvp', data);
export const sendMessage = (data: Message & SubmissionKey & { website: string }) => sendToSheets('message', data);
