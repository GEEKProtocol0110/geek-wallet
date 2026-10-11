import kaspa from '@dfns/kaspa-wasm';
import {baseUnits} from './amounts';
export {baseUnits,displayUnits} from './amounts';
export type Reading<T> = {status:'available';value:T;source:string;checkedAt:number} | {status:'unavailable';value:null;source:string;checkedAt:number};
export type Activity = {id:string;accepted:boolean|null;time:number|null};
export type Portfolio = {address:string;network:'mainnet';kas:Reading<string>;geek:Reading<{available:string;locked:string}>;activity:Reading<Activity[]>};
export function normalizeAddress(raw: unknown): string {
 if(typeof raw!=='string' || raw.length>120) throw new Error('Enter a valid Kaspa Mainnet public address.');
 const value=raw.trim();if(value!==value.toLowerCase() && value!==value.toUpperCase()) throw new Error('Enter a valid Kaspa Mainnet public address.');
 let parsed;try {parsed=new kaspa.Address(value.toLowerCase());if(parsed.prefix!=='kaspa') throw new Error('network');return parsed.toString();}catch {throw new Error('Enter a valid Kaspa Mainnet public address.');}finally {parsed?.free();}
}
export function parseKas(value:unknown,address:string):string {
 if(!value||typeof value!=='object')throw new Error('Invalid balance');const v=value as Record<string,unknown>;
 if(v.address!==undefined && v.address!==address)throw new Error('Wrong address');return baseUnits(v.balance);
}
export function parseGeek(value:unknown):{available:string;locked:string} {
 if(!value||typeof value!=='object')throw new Error('Invalid token balance');const v=value as Record<string,unknown>;
 if(v.message!=='successful'||!Array.isArray(v.result)||v.result.length>100)throw new Error('Invalid token balance');
 const matches=v.result.filter(row=>row&&typeof row==='object'&&String(row.tick).toUpperCase()==='GEEK');
 if(matches.length===0){if(v.next!==undefined&&v.next!==null&&v.next!=='')throw new Error('Incomplete token page');return {available:'0',locked:'0'};}
 if(matches.length!==1)throw new Error('Ambiguous token balance');const row=matches[0];
 if(String(row.dec)!=='8')throw new Error('Unexpected token decimals');
 return {available:baseUnits(row.balance),locked:baseUnits(row.locked)};
}
export function parseActivity(value:unknown):Activity[] {
 if(!Array.isArray(value)||value.length>20)throw new Error('Invalid activity');const seen=new Set<string>();
 return value.map(row=>{if(!row||typeof row!=='object')throw new Error('Invalid activity');const v=row as Record<string,unknown>;
 if(typeof v.transaction_id!=='string'||! /^[a-f0-9]{64}$/i.test(v.transaction_id)||seen.has(v.transaction_id.toLowerCase()))throw new Error('Invalid transaction ID');seen.add(v.transaction_id.toLowerCase());
 const time=typeof v.block_time==='number'&&Number.isSafeInteger(v.block_time)&&v.block_time>0?v.block_time:null;
 return {id:v.transaction_id.toLowerCase(),accepted:typeof v.is_accepted==='boolean'?v.is_accepted:null,time};});
}
const json = async(url:string,fetcher:typeof fetch,signal:AbortSignal) => {
 const r=await fetcher(url,{headers:{Accept:'application/json'},cache:'no-store',signal});if(!r.ok)throw new Error('Source unavailable');
 const length=Number(r.headers.get('content-length'));if(length>1000000)throw new Error('Response too large');
 const raw=await r.text();if(raw.length>1000000)throw new Error('Response too large');return JSON.parse(raw) as unknown;
};
export async function loadPortfolio(raw:unknown,fetcher:typeof fetch=fetch):Promise<Portfolio> {
 const address=normalizeAddress(raw);const escaped=encodeURIComponent(address);
 async function read<T>(source:string,parse:(v:unknown)=>T):Promise<Reading<T>> {
  const control=new AbortController();const timer=setTimeout(()=>control.abort(),10000);
  try {return {status:'available',value:parse(await json(source,fetcher,control.signal)),source,checkedAt:Date.now()};}
  catch{return {status:'unavailable',value:null,source,checkedAt:Date.now()};}finally{clearTimeout(timer);}
 }
 const [kas,geek,activity]=await Promise.all([
  read(`https://api.kaspa.org/addresses/${escaped}/balance`,v=>parseKas(v,address)),
  read(`https://api.kasplex.org/v1/krc20/address/${address}/tokenlist?tick=GEEK`,parseGeek),
  read(`https://api.kaspa.org/addresses/${escaped}/full-transactions?limit=20&offset=0&resolve_previous_outpoints=no`,parseActivity)
 ]);
 return {address,network:'mainnet',kas,geek,activity};
}
