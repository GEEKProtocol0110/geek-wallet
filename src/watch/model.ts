import kaspa from '@dfns/kaspa-wasm';
import {baseUnits} from './amounts';
import {nativeDetails} from './activity';
import type {Activity} from './activity';
import {readSource} from './provider';
import type {Reading} from './provider';
import {parseTokenPage,tokenCursor} from './tokens';
import type {TokenPage} from './tokens';
import {readCovenants} from './covenants';
export type {Reading} from './provider';
export type {Activity} from './activity';
export {baseUnits,displayUnits} from './amounts';
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
 if(v.message!=='successful'||!Array.isArray(v.result)||v.result.length>1)throw new Error('Invalid token balance');
 // This parser is for the specific-token endpoint, never a partial token list.
 for(const cursor of [v.next,v.prev])if(cursor!==undefined&&cursor!==null&&cursor!=='')throw new Error('Incomplete token balance');
 if(v.result.length===0)return {available:'0',locked:'0'};
 const row=v.result[0];
 if(!row||typeof row!=='object'||typeof row.tick!=='string'||row.tick.toUpperCase()!=='GEEK')throw new Error('Wrong token balance');
 const available=baseUnits(row.balance),locked=baseUnits(row.locked);
 // Kasplex returns this explicit sentinel when the address has no GEEK record.
 const emptyRecord=String(row.dec)==='0'&&available==='0'&&locked==='0'&&String(row.opScoreMod)==='0';
 if(String(row.dec)!=='8'&&!emptyRecord)throw new Error('Unexpected token decimals');
 return {available,locked};
}
export function parseActivity(value:unknown,address:string):Activity[] {
 if(!Array.isArray(value)||value.length>20)throw new Error('Invalid activity');const seen=new Set<string>();
 return value.map(row=>{if(!row||typeof row!=='object')throw new Error('Invalid activity');const v=row as Record<string,unknown>;
 if(typeof v.transaction_id!=='string'||! /^[a-f0-9]{64}$/i.test(v.transaction_id)||seen.has(v.transaction_id.toLowerCase()))throw new Error('Invalid transaction ID');seen.add(v.transaction_id.toLowerCase());
 const time=typeof v.block_time==='number'&&Number.isSafeInteger(v.block_time)&&v.block_time>0&&v.block_time<=8640000000000000?v.block_time:null;
 return {id:v.transaction_id.toLowerCase(),accepted:typeof v.is_accepted==='boolean'?v.is_accepted:null,time,details:nativeDetails(v,address,normalizeAddress)};});
}
export async function loadTokens(raw:unknown,cursorValue:unknown=null,fetcher:typeof fetch=fetch):Promise<Reading<TokenPage>>{
 const address=normalizeAddress(raw),cursor=tokenCursor(cursorValue);
 const source=`https://api.kasplex.org/v1/krc20/address/${address}/tokenlist${cursor?`?next=${encodeURIComponent(cursor)}`:''}`;
 return readSource(source,value=>{const page=parseTokenPage(value);if(cursor&&page.next===cursor)throw new Error('Repeated token cursor');return page;},fetcher);
}
export async function loadCovenants(raw:unknown,fetcher:typeof fetch=fetch){return readCovenants(normalizeAddress(raw),fetcher);}
export async function loadPortfolio(raw:unknown,fetcher:typeof fetch=fetch):Promise<Portfolio> {
 const address=normalizeAddress(raw);const escaped=encodeURIComponent(address);
 const read=<T>(source:string,parse:(v:unknown)=>T)=>readSource(source,parse,fetcher);
 const [kas,geek,activity]=await Promise.all([
  read(`https://api.kaspa.org/addresses/${escaped}/balance`,v=>parseKas(v,address)),
  read(`https://api.kasplex.org/v1/krc20/address/${address}/token/GEEK`,parseGeek),
  read(`https://api.kaspa.org/addresses/${escaped}/full-transactions?limit=20&resolve_previous_outpoints=light`,v=>parseActivity(v,address))
 ]);
 return {address,network:'mainnet',kas,geek,activity};
}
