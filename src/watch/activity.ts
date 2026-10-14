import {baseUnits} from './amounts';

export type NativeParty = {index:number;address:string|null;amount:string|null};
export type NativeDetails = {
 inputs:NativeParty[]|null;
 outputs:NativeParty[]|null;
 totalInput:string|null;
 totalOutput:string|null;
 fee:string|null;
 addressInput:string|null;
 addressOutput:string|null;
 change:{direction:'increase'|'decrease'|'unchanged';amount:string}|null;
};
export type Activity = {id:string;accepted:boolean|null;time:number|null;details:NativeDetails};

function amount(value:unknown):string|null {
 try{return baseUnits(value);}catch{return null;}
}

function parties(value:unknown,input:boolean,normalize:(raw:unknown)=>string):NativeParty[]|null {
 if(!Array.isArray(value)||value.length>1000)return null;
 const indices=new Set<number>();
 const result:NativeParty[]=[];
 for(const row of value){
  if(!row||typeof row!=='object')return null;
  const v=row as Record<string,unknown>;
  if(typeof v.index!=='number'||!Number.isSafeInteger(v.index)||v.index<0||indices.has(v.index))return null;
  indices.add(v.index);
  let address:string|null=null;
  try{address=normalize(input?v.previous_outpoint_address:v.script_public_key_address);}catch{}
  result.push({index:v.index,address,amount:amount(input?v.previous_outpoint_amount:v.amount)});
 }
 // Indices start at zero; a missing position would make totals misleading.
 if(result.some(p=>p.index>=result.length))return null;
 return result.sort((a,b)=>a.index-b.index);
}

function total(rows:NativeParty[]|null,address?:string):string|null {
 if(!rows?.length||rows.some(p=>p.amount===null||(address!==undefined&&p.address===null)))return null;
 const sum=rows.reduce((n,p)=>n+(address===undefined||p.address===address?BigInt(p.amount!):0n),0n);
 return amount(sum.toString());
}

export function nativeDetails(row:Record<string,unknown>,address:string,normalize:(raw:unknown)=>string):NativeDetails {
 const inputs=parties(row.inputs,true,normalize),outputs=parties(row.outputs,false,normalize);
 const totalInput=total(inputs),totalOutput=total(outputs);
 const addressInput=total(inputs,address),addressOutput=total(outputs,address);
 let fee:string|null=null;
 if(totalInput!==null&&totalOutput!==null&&BigInt(totalInput)>=BigInt(totalOutput)){
  fee=amount((BigInt(totalInput)-BigInt(totalOutput)).toString());
 }
 // Contradictory totals must not become a claimed address movement.
 const consistent=totalInput!==null&&totalOutput!==null&&BigInt(totalInput)>=BigInt(totalOutput);
 let change:NativeDetails['change']=null;
 if(consistent&&addressInput!==null&&addressOutput!==null){
  const delta=BigInt(addressOutput)-BigInt(addressInput);
  change={direction:delta>0n?'increase':delta<0n?'decrease':'unchanged',amount:(delta<0n?-delta:delta).toString()};
 }
 return {inputs,outputs,totalInput,totalOutput,fee,addressInput,addressOutput,change};
}

export function acceptance(accepted:boolean|null):{label:string;explanation:string} {
 if(accepted===true)return {label:'Accepted by source',explanation:'Kaspa REST reports this transaction as accepted. This does not verify a GEEK token operation or a reward payout.'};
 if(accepted===false)return {label:'Not accepted by source',explanation:'Kaspa REST reports this transaction as not accepted. The source does not establish whether it is pending, rejected, or will be accepted later. Do not treat it as a completed payment.'};
 return {label:'Acceptance unavailable',explanation:'The source did not report acceptance. A transaction ID alone does not establish a completed payment.'};
}

export function movement(details:NativeDetails):string {
 if(!details.change)return 'Address change unavailable';
 if(details.change.direction==='increase')return 'KAS increase at this address';
 if(details.change.direction==='decrease')return 'KAS decrease at this address';
 return 'No net KAS change at this address';
}
