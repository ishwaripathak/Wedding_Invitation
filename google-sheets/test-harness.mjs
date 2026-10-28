// A local test double for the Google services used by Code.gs, not a deployment.
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
export function createHarness() {
  const state={properties:new Map(),sheets:new Map(),locked:false,busy:false,failWrites:false,failFlush:false,active:true,flushes:0,timezone:null};
  class Range {
    constructor(sheet,row,column,rows=1,columns=1){Object.assign(this,{sheet,row,column,rows,columns});}
    getValues(){return Array.from({length:this.rows},(_,r)=>Array.from({length:this.columns},(_,c)=>this.sheet.rows[this.row+r-1]?.[this.column+c-1]??''));}
    getValue(){return this.getValues()[0][0];}
    setValues(values){if(state.failWrites)throw new Error('Private provider error');for(let r=0;r<this.rows;r++){const dest=this.sheet.rows[this.row+r-1]??=[];for(let c=0;c<this.columns;c++)dest[this.column+c-1]=values[r][c];}return this;}
    setBackground(){return this;} setFontColor(){return this;} setFontWeight(){return this;}
    setNumberFormat(){return this;} setWrap(){return this;}
    createTextFinder(id){let entire=false;return{matchEntireCell(value){entire=value;return this;},matchCase(){return this;},findNext:()=>{if(!entire)throw Error('IDs must match the entire cell');for(let r=0;r<this.rows;r++)if(this.sheet.rows[this.row+r-1]?.[this.column-1]===id)return{getRow:()=>this.row+r};return null;}};}
  }
  class Sheet {
    constructor(name){this.name=name;this.rows=[];this.maxRows=1000;this.hidden=[];}
    getRange(...args){return new Range(this,...args);}
    getLastRow(){return this.rows.length;}
    getMaxRows(){return this.maxRows;}
    insertRowsAfter(_,count){this.maxRows+=count;}
    setFrozenRows(n){this.frozen=n;}
    hideColumns(from,count=1){this.hidden.push([from,count]);}
    setColumnWidth(){}
  }
  const book={getId:()=> 'private-test-sheet-id',getSheetByName:name=>state.sheets.get(name),insertSheet(name){const sheet=new Sheet(name);state.sheets.set(name,sheet);return sheet;},setSpreadsheetTimeZone:zone=>{state.timezone=zone;}};
  const context=vm.createContext({Date,JSON,Object,Array,Number,String,Error,SpreadsheetApp:{getActiveSpreadsheet:()=>state.active?book:null,openById(id){if(id!=='private-test-sheet-id')throw new Error('Private sheet unavailable');return book;},flush(){if(state.failFlush)throw new Error('Provider write did not confirm');state.flushes++;}},PropertiesService:{getScriptProperties:()=>({getProperty:key=>state.properties.get(key),setProperty:(key,value)=>state.properties.set(key,value)})},LockService:{getScriptLock:()=>{let held=false;return{waitLock(){if(state.busy||state.locked)throw new Error('Lock unavailable');state.locked=true;held=true;},tryLock(){if(state.busy||state.locked)return false;state.locked=true;held=true;return true;},hasLock:()=>held,releaseLock(){if(held){state.locked=false;held=false;}}};}},Utilities:{DigestAlgorithm:{SHA_256:'sha256'},Charset:{UTF_8:'utf8'},computeDigest:(_,value)=>[...createHash('sha256').update(value).digest()].map(byte=>byte>127?byte-256:byte)},ContentService:{MimeType:{JSON:'application/json'},createTextOutput:content=>({setMimeType(){return this;},getContent:()=>content})}});
  vm.runInContext(readFileSync(new URL('./Code.gs',import.meta.url),'utf8'),context);
  return{state,book,context,setup:()=>context.setup(),get:()=>JSON.parse(context.doGet().getContent()),post:body=>JSON.parse(context.doPost({postData:{contents:typeof body==='string'?body:JSON.stringify(body)}}).getContent())};
}
