import {test} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID,randomBytes} from 'node:crypto';
import {createHarness} from './test-harness.mjs';
const identity=()=>({id:randomUUID(),token:randomBytes(32).toString('hex')});
const rsvp=()=>({action:'rsvp',...identity(),name:'Test Guest',email:'guest@example.test',attendance:'yes',guests:2,dietary:'Vegetarian',website:''});
const message=()=>({action:'message',...identity(),name:'Test Guest',message:'Wishing you a lifetime of happiness!',website:''});
function ready(){const h=createHarness();h.setup();return h;}
test('setup creates both tabs, hides technical columns, uses India time and preserves existing rows on repeat setup',()=>{
 const h=ready();h.post(message());h.setup();assert.deepEqual([...h.state.sheets.keys()],['RSVPs','Messages']);assert.equal(h.state.timezone,'Asia/Kolkata');assert.equal(h.book.getSheetByName('Messages').rows.length,2);assert.equal(h.book.getSheetByName('RSVPs').frozen,1);assert.deepEqual(h.book.getSheetByName('RSVPs').hidden[0],[1,2]);assert.equal(h.state.locked,false);
});
test('setup never overwrites a tab that already contains other data',()=>{
 const h=createHarness();const sheet=h.book.insertSheet('RSVPs');sheet.rows.push(['Existing family information']);assert.throws(()=>h.setup(),/will not be overwritten/);assert.equal(sheet.rows[0][0],'Existing family information');assert.equal(h.state.locked,false);
});
test('RSVPs and messages are saved to separate tabs and GET exposes no guest details or spreadsheet ID',()=>{
 const h=ready();const guest=rsvp();const wish=message();const receipt=h.post(guest);assert.equal(receipt.ok,true);assert.equal(receipt.id,guest.id);assert.ok(Number.isFinite(Date.parse(receipt.submittedAt)));assert.equal(h.post(wish).ok,true);
 const row=h.book.getSheetByName('RSVPs').rows[1];assert.equal(row[2],guest.name);assert.equal(row[3],guest.email);assert.equal(row[5],2);assert.notEqual(row[1],guest.token);assert.equal(row[1].length,64);assert.equal(h.book.getSheetByName('Messages').rows[1][3],wish.message);
 const health=JSON.stringify(h.get());assert.ok(!health.includes(guest.email));assert.ok(!health.includes(wish.message));assert.ok(!health.includes('private-test-sheet-id'));
});
test('retries do not duplicate rows; RSVP edits require the original editing key',()=>{
 const h=ready();const guest=rsvp();const wish=message();h.post(guest);h.post(guest);assert.equal(h.post({...guest,guests:4}).ok,true);assert.equal(h.post({...guest,token:'a'.repeat(64),guests:6}).ok,false);assert.equal(h.book.getSheetByName('RSVPs').rows.length,2);assert.equal(h.book.getSheetByName('RSVPs').rows[1][5],4);
 h.post(wish);assert.equal(h.post(wish).ok,true);assert.equal(h.book.getSheetByName('Messages').rows.length,2);assert.equal(h.post({...wish,message:'A different message with the same ID.'}).ok,false);
});
test('rejects invalid input and bots before writing any rows',()=>{
 const h=ready();for(const body of [null,[],{...rsvp(),guests:7},{...rsvp(),attendance:'no',guests:2},{...rsvp(),email:'invalid'},{...message(),message:'no'},{...message(),website:'spam'},{...message(),token:'invalid'},{...message(),id:'invalid'},{...message(),action:'read-all'},{...message(),name:'bad\u0000name'}])assert.equal(h.post(body).ok,false);
 assert.equal(h.post('not json').ok,false);assert.equal(h.post('x'.repeat(12001)).ok,false);assert.equal(h.book.getSheetByName('RSVPs').rows.length,1);assert.equal(h.book.getSheetByName('Messages').rows.length,1);
});
test('spreadsheet formulas are escaped while repeated messages remain idempotent',()=>{
 const h=ready();for(const text of ['=HYPERLINK("https://example.test","click")','+suspicious text','-suspicious text','@suspicious text']){const wish={...message(),message:text};assert.equal(h.post(wish).ok,true);assert.equal(h.post(wish).ok,true);assert.equal(h.book.getSheetByName('Messages').rows.at(-1)[3],"'"+text);}assert.equal(h.book.getSheetByName('Messages').rows.length,5);
});
test('a busy spreadsheet returns a retryable error and does not append a row',()=>{
 const h=ready();h.state.busy=true;const wish=message();assert.equal(h.post(wish).ok,false);assert.equal(h.book.getSheetByName('Messages').rows.length,1);h.state.busy=false;assert.equal(h.post(wish).ok,true);assert.equal(h.state.locked,false);
});
test('a write failure or unconfirmed flush never reports success; retry recovers without duplication',()=>{
 const h=ready();const wish=message();h.state.failWrites=true;const failed=h.post(wish);assert.equal(failed.ok,false);assert.ok(!JSON.stringify(failed).includes('Private provider error'));assert.equal(h.state.locked,false);
 h.state.failWrites=false;h.state.failFlush=true;assert.equal(h.post(wish).ok,false);assert.equal(h.state.locked,false);h.state.failFlush=false;assert.equal(h.post(wish).ok,true);assert.equal(h.book.getSheetByName('Messages').rows.length,2);
});
test('unconfigured scripts provide instructions without exposing spreadsheet data',()=>{
 const h=createHarness();assert.equal(h.get().ok,false);assert.equal(h.post(message()).ok,false);h.state.active=false;assert.throws(()=>h.setup(),/Extensions > Apps Script/);
});
test('RSVP email is optional, while nonempty email addresses still require valid formatting',()=>{
 const h=ready();
 for(const email of ['', '   ', undefined, null]){
  const result=h.post({...rsvp(),email});assert.equal(result.ok,true);
  assert.equal(h.book.getSheetByName('RSVPs').rows.at(-1)[3],'');
 }
 assert.equal(h.post({...rsvp(),email:' Guest@Example.Test '}).ok,true);
 assert.equal(h.book.getSheetByName('RSVPs').rows.at(-1)[3],'guest@example.test');
 for(const email of ['invalid','guest@invalid', 'x'.repeat(201),false])assert.equal(h.post({...rsvp(),email}).ok,false);
 assert.equal(h.book.getSheetByName('RSVPs').rows.length,6);
});
