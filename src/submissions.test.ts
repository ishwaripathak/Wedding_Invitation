import {afterEach,describe,expect,it,vi} from 'vitest';
const url='https://script.google.com/macros/s/TEST_DEPLOYMENT_ID/exec';
const key={id:'78ef0d9e-7c9d-448f-b7de-e1b45327feee',token:'a'.repeat(64)};
const payload={...key,name:'Test Guest',message:'A lovely wedding wish.',website:''};
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();vi.resetModules();});
async function configured(){vi.stubEnv('VITE_GOOGLE_SHEETS_URL',url);return import('./submissions');}
const response=(value:unknown)=>new Response(JSON.stringify(value),{status:200});
describe('Google Sheets transport',()=>{
 it('sends JSON as text/plain without authentication or preflight-only headers',async()=>{
  const fetcher=vi.fn().mockResolvedValue(response({ok:true,id:key.id,submittedAt:'2026-10-28T12:00:00Z'}));vi.stubGlobal('fetch',fetcher);const api=await configured();await expect(api.sendMessage(payload)).resolves.toEqual({id:key.id,submittedAt:'2026-10-28T12:00:00Z'});
  const [target,options]=fetcher.mock.calls[0];expect(target).toBe(url);expect(target).not.toContain(key.token);expect(options).toMatchObject({method:'POST',mode:'cors',redirect:'follow',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'}});expect(JSON.parse(options.body)).toMatchObject({...payload,action:'message'});
 });
 it('stops before network access when the deployment URL is missing or invalid',async()=>{
  const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);vi.stubEnv('VITE_GOOGLE_SHEETS_URL','');let api=await import('./submissions');expect(api.submissionsConfigured).toBe(false);await expect(api.sendMessage(payload)).rejects.toThrow('will open soon');expect(fetcher).not.toHaveBeenCalled();
  vi.resetModules();vi.stubEnv('VITE_GOOGLE_SHEETS_URL',url.replace('/exec','/dev'));api=await import('./submissions');expect(api.submissionsConfigured).toBe(false);
 });
 it('does not mistake an Apps Script HTTP-200 error for a saved submission',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(response({ok:false,error:'The guest book is busy.'})));const api=await configured();await expect(api.sendMessage(payload)).rejects.toThrow('guest book is busy');
 });
 it('requires a matching receipt ID and valid timestamp',async()=>{
  const fetcher=vi.fn();vi.stubGlobal('fetch',fetcher);const api=await configured();for(const receipt of [{ok:true,id:'wrong',submittedAt:'2026-10-28T12:00:00Z'},{ok:true,id:key.id,submittedAt:'invalid'},{id:key.id,submittedAt:'2026-10-28T12:00:00Z'}]){fetcher.mockResolvedValue(response(receipt));await expect(api.sendMessage(payload)).rejects.toThrow('could not be confirmed');}
 });
 it('rejects a login page instead of claiming receipt',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response('<html>Google sign-in</html>')));const api=await configured();await expect(api.sendMessage(payload)).rejects.toThrow('could not be confirmed');
 });
 it('gives a retryable error after a network interruption',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));const api=await configured();await expect(api.sendMessage(payload)).rejects.toThrow('your form has been kept');
 });
 it('scopes saved receipts to the deployment instead of reusing old Excel receipts',async()=>{
  const api=await configured();expect(api.submissionStorageKey('rsvp')).toContain('TEST_DEPLOYMENT_ID');expect(api.submissionStorageKey('rsvp')).not.toBe('sagar-ishwari-rsvp-receipt-v1');
 });
});
