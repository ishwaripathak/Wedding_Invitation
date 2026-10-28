import {describe,it,expect,vi,afterEach} from 'vitest';
import {getTimeRemaining} from './components/Countdown';
import {readStored,writeStored} from './storage';
import {weddingData} from './data/weddingData';
describe('wedding time in India',()=>{
 it('uses the wedding time at 10:00 IST, not browser-local time',()=>{expect(new Date(weddingData.date).toISOString()).toBe('2027-01-16T04:30:00.000Z')});
 it('counts across a day boundary',()=>{expect(getTimeRemaining(weddingData.date,Date.parse('2027-01-15T03:28:57Z'))).toMatchObject({days:1,hours:1,minutes:1,seconds:3})});
 it('never shows negative time after the wedding',()=>{expect(getTimeRemaining(weddingData.date,Date.parse('2028-01-01'))).toMatchObject({days:0,hours:0,minutes:0,seconds:0,total:0})});
});
describe('browser persistence recovery',()=>{
 afterEach(()=>vi.unstubAllGlobals());
 const isStrings=(v:unknown):v is string[]=>Array.isArray(v)&&v.every(x=>typeof x==='string');
 it('recovers safely from corrupt storage',()=>{vi.stubGlobal('localStorage',{getItem:()=>'{invalid'});expect(readStored('wishes',[],isStrings)).toEqual([])});
 it('rejects unexpected saved data',()=>{vi.stubGlobal('localStorage',{getItem:()=>'{"name":"bad shape"}'});expect(readStored('wishes',[],isStrings)).toEqual([])});
 it('reports storage denial rather than claiming success',()=>{vi.stubGlobal('localStorage',{setItem:()=>{throw Error('Quota exceeded')}});expect(writeStored('rsvp',{})).toBe(false)});
 it('restores valid saved wishes',()=>{vi.stubGlobal('localStorage',{getItem:()=>'["Blessings"]'});expect(readStored('wishes',[],isStrings)).toEqual(['Blessings'])});
});
