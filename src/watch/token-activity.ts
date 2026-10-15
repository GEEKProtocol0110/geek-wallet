import {baseUnits} from './amounts';

export type TokenOperation={id:string;score:string;operation:string;amount:string|null;from:string|null;to:string|null;transactionAccepted:boolean|null;operationAccepted:boolean|null;error:string;time:number|null};
export type TokenActivityPage={operations:TokenOperation[];next:string|null};
export function operationTicker(value:unknown):string{
 if(typeof value!=='string'||!/^[a-z]{4,6}$/i.test(value))throw new Error('Invalid ticker');return value.toUpperCase();
}
export function operationCursor(value:unknown):string|null{
 if(value===null||value===undefined||value==='')return null;
 if(typeof value!=='string'||!/^[1-9][0-9]{0,29}$/.test(value))throw new Error('Invalid operation cursor');return value;
}
const accepted=(value:unknown)=>value==='1'?true:value==='0'?false:null;
export function parseTokenActivity(value:unknown,address:string,tick:string,normalize:(raw:unknown)=>string):TokenActivityPage{
 if(!value||typeof value!=='object')throw new Error('Invalid operations');const v=value as Record<string,unknown>;
 if(v.message!=='successful'||!Array.isArray(v.result)||v.result.length>100)throw new Error('Invalid operations');
 const next=operationCursor(v.next),seen=new Set<string>();
 const operations=v.result.map(row=>{
  if(!row||typeof row!=='object')throw new Error('Invalid operation');
  if(row.p!=='KRC-20'||operationTicker(row.tick)!==tick||row.ca)throw new Error('Wrong token identity');
  if(typeof row.hashRev!=='string'||!/^[a-f0-9]{64}$/i.test(row.hashRev)||typeof row.op!=='string'||!/^[a-z]{1,20}$/.test(row.op))throw new Error('Invalid operation identity');
  const id=row.hashRev.toLowerCase(),score=operationCursor(row.opScore);if(!score||seen.has(`${id}:${score}`))throw new Error('Duplicate operation');seen.add(`${id}:${score}`);
  const from=row.from?normalize(row.from):null,to=row.to?normalize(row.to):null;
  if(from!==address&&to!==address)throw new Error('Unrelated operation');
  const amount=row.amt===undefined?null:baseUnits(row.amt);
  const time=typeof row.mtsAdd==='string'&&/^[0-9]{1,16}$/.test(row.mtsAdd)?Number(row.mtsAdd):null;
  return {id,score,operation:row.op,amount,from,to,transactionAccepted:accepted(row.txAccept),operationAccepted:accepted(row.opAccept),error:typeof row.opError==='string'?row.opError.slice(0,200):'',time:time!==null&&time>0&&time<=8640000000000000?time:null};
 });
 if(!operations.length&&next)throw new Error('Incomplete operations');return {operations,next};
}
