import {baseUnits} from './amounts';

export type TokenBalance={id:string;symbol:string|null;contract:string|null;decimals:number;available:string;locked:string};
export type TokenPage={tokens:TokenBalance[];next:string|null};

export function tokenCursor(value:unknown):string|null{
 if(value===undefined||value===null||value==='')return null;
 if(typeof value!=='string'||! /^(?:[A-Z]{4,6}|[a-fA-F0-9]{64})$/.test(value))throw new Error('Invalid token cursor');
 return value;
}

export function tokenDecimals(value:unknown):number{
 const s=String(value);
 if(! /^(?:[0-9]|1[0-8])$/.test(s))throw new Error('Invalid token decimals');
 return Number(s);
}

export function parseTokenPage(value:unknown):TokenPage{
 if(!value||typeof value!=='object')throw new Error('Invalid token page');
 const v=value as Record<string,unknown>;
 if(v.message!=='successful'||!Array.isArray(v.result)||v.result.length>100)throw new Error('Invalid token page');
 const next=tokenCursor(v.next),seen=new Set<string>();
 const tokens=v.result.map(row=>{
  if(!row||typeof row!=='object')throw new Error('Invalid token');
  const symbol=typeof row.tick==='string'&&/^[a-z]{4,6}$/i.test(row.tick)?row.tick.toUpperCase():null;
  const contract=typeof row.ca==='string'&&/^[a-f0-9]{64}$/i.test(row.ca)?row.ca.toLowerCase():null;
  if((row.tick!==undefined&&!symbol)||(row.ca!==undefined&&!contract)||(!symbol&&!contract))throw new Error('Invalid token identity');
  const id=contract||symbol!;if(seen.has(id))throw new Error('Duplicate token');seen.add(id);
  return {id,symbol,contract,decimals:tokenDecimals(row.dec),available:baseUnits(row.balance),locked:baseUnits(row.locked)};
 });
 if(tokens.length===0&&next)throw new Error('Empty token page with cursor');
 return {tokens,next};
}
