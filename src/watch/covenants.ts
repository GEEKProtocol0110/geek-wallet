import {baseUnits} from './amounts';
import {tokenDecimals} from './tokens';
import {providerJson} from './provider';
import type {Reading} from './provider';

export type CovenantToken={id:string;name:string;standard:'legacy-kcc20'|'kron-native';decimals:number;balance:string|null;validation:string;sourceDaa:number};
export type CovenantSnapshot={tokens:CovenantToken[];ownerType:string;indexedDaa:number;networkDaa:number;lagDaa:number;nodeUpdatedAt:string;unresolved:number;behind:boolean};

function record(value:unknown):Record<string,unknown>{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('Invalid covenant response');
 return value as Record<string,unknown>;
}
function count(value:unknown):number{
 if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0)throw new Error('Invalid covenant count');
 return value;
}

export function parseCovenants(value:unknown,statusValue:unknown,address:string,now=Date.now()):CovenantSnapshot{
 const data=record(value),status=record(statusValue);
 if(data.address!==address||typeof data.owner!=='string'||! /^[a-f0-9]{64}$/.test(data.owner))throw new Error('Wrong covenant owner');
 if(!['wallet','script','covenant'].includes(String(data.owner_type)))throw new Error('Unknown owner type');
 if(record(status.capabilities).balances!==true)throw new Error('Covenant balances unavailable');
 const indexedDaa=count(status.max_daa),networkDaa=count(status.network_daa),unresolved=count(status.unresolved_kcc20_transitions);
 if(indexedDaa>networkDaa)throw new Error('Inconsistent covenant checkpoint');
 if(!Array.isArray(status.checkpoints))throw new Error('Missing covenant checkpoint');
 const node=status.checkpoints.find(c=>c&&typeof c==='object'&&c.source==='node');
 if(!node||typeof node.updated_at!=='string')throw new Error('Missing node checkpoint');
 const at=Date.parse(node.updated_at);
 if(!Number.isFinite(at)||at>now+300000||now-at>900000)throw new Error('Stale covenant source');
 if(!Array.isArray(data.portfolio)||data.portfolio.length>200)throw new Error('Invalid covenant portfolio');
 const summary=record(data.summary);
 if(count(summary.token_count)!==data.portfolio.length)throw new Error('Incomplete covenant portfolio');
 const seen=new Set<string>();
 const tokens=data.portfolio.map(value=>{
  const row=record(value);
  if(typeof row.token_id!=='string'||! /^[a-f0-9]{64}$/.test(row.token_id)||seen.has(row.token_id))throw new Error('Invalid covenant identity');
  seen.add(row.token_id);
  // These are the provider's existing profiles, not an assertion of final KCC-20 conformance.
  if(row.standard!=='legacy-kcc20'&&row.standard!=='kron-native')throw new Error('Unsupported covenant profile');
  const validation=typeof row.validation_status==='string'&&/^[a-z_]{1,40}$/.test(row.validation_status)?row.validation_status:null;
  if(!validation)throw new Error('Missing source validation');
  const rawBalance=baseUnits(row.balance),sourceDaa=count(row.source_daa);
  if(sourceDaa>indexedDaa)throw new Error('Inconsistent token checkpoint');
  const rawName=row.display_name??row.ticker??row.name;
  const name=typeof rawName==='string'&&rawName.trim().length>0&&rawName.length<=80&&!/[\u0000-\u001f\u007f]/.test(rawName)?rawName:'Unnamed covenant token';
  return {id:row.token_id,name,standard:row.standard,decimals:tokenDecimals(row.decimals),balance:['verified','template_verified'].includes(validation)?rawBalance:null,validation,sourceDaa} as CovenantToken;
 });
 const lagDaa=networkDaa-indexedDaa;
 return {tokens,ownerType:String(data.owner_type),indexedDaa,networkDaa,lagDaa,nodeUpdatedAt:new Date(at).toISOString(),unresolved,behind:lagDaa>6000};
}

export async function readCovenants(address:string,fetcher:typeof fetch=fetch):Promise<Reading<CovenantSnapshot>>{
 const source=`https://kcc20.info/v1/addresses/${encodeURIComponent(address)}/analysis?activity_limit=1&counterparty_limit=1`;
 const control=new AbortController(),timer=setTimeout(()=>control.abort(),10000);
 try{
  const [data,status]=await Promise.all([providerJson(source,fetcher,control.signal),providerJson('https://kcc20.info/v1/status',fetcher,control.signal)]);
  return {status:'available',value:parseCovenants(data,status,address),source,checkedAt:Date.now()};
 }catch{return {status:'unavailable',value:null,source,checkedAt:Date.now()};}
 finally{clearTimeout(timer);}
}
