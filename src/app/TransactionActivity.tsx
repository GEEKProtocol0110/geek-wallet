import {displayUnits} from '../watch/amounts';
import {acceptance,movement} from '../watch/activity';
import type {Activity,NativeParty} from '../watch/activity';

function kas(value:string|null){return value===null?'Unavailable':`${displayUnits(value)} KAS`;}

function Parties({rows,address,input}:{rows:NativeParty[]|null;address:string;input:boolean}){
 if(rows===null)return <p>{input?'Input':'Output'} details unavailable.</p>;
 if(rows.length===0)return <p>No {input?'inputs':'outputs'} reported. A fee cannot be inferred from an empty list.</p>;
 return <ol className="parties" tabIndex={0} aria-label={input?'Transaction inputs':'Transaction outputs'}>{rows.map(p=><li key={p.index}>
  <div><strong>{input?'Input':'Output'} {p.index+1}</strong><strong>{kas(p.amount)}</strong></div>
  <p>{p.address===address?'Tracked address':p.address?'Other address · ownership unknown':'Address unavailable or unsupported script'}</p>
  {p.address&&<a className="full-address" href={`https://explorer.kaspa.org/addresses/${encodeURIComponent(p.address)}`} target="_blank" rel="noopener noreferrer">{p.address} ↗</a>}
 </li>)}</ol>;
}

export default function TransactionActivity({tx,address}:{tx:Activity;address:string}){
 const status=acceptance(tx.accepted),d=tx.details;
 const change=d.change?`${d.change.direction==='increase'?'+':d.change.direction==='decrease'?'−':''}${displayUnits(d.change.amount)} KAS`:'Unavailable';
 return <li className="transaction">
  <div className="transaction-top"><strong>{movement(d)}</strong><span className={`acceptance ${tx.accepted===true?'accepted':''}`}>{status.label}</span></div>
  <p className="transaction-amount">{change}</p>
  <p className="transaction-time">{tx.time?<><time dateTime={new Date(tx.time).toISOString()}>{new Date(tx.time).toLocaleString()}</time> · Source block time</>:'Block time unavailable'}</p>
  <details>
   <summary>Explain transaction <span>{tx.id.slice(0,8)}…{tx.id.slice(-6)}</span></summary>
   <div className="transaction-details">
    <p>{status.explanation}</p>
    <dl className="transaction-facts">
     <div><dt>Asset & network</dt><dd>KAS · Kaspa Mainnet</dd></div>
     <div><dt>Spent from tracked address</dt><dd>{kas(d.addressInput)}</dd></div>
     <div><dt>Outputs to tracked address</dt><dd>{kas(d.addressOutput)}</dd></div>
     <div><dt>All transaction inputs</dt><dd>{kas(d.totalInput)}</dd></div>
     <div><dt>All transaction outputs</dt><dd>{kas(d.totalOutput)}</dd></div>
     <div><dt>Whole transaction fee</dt><dd>{kas(d.fee)}</dd></div>
    </dl>
    <p>The address change is outputs to this address minus inputs spent from it. It describes this transaction, not your current balance{tx.accepted!==true?' or a completed payment':''}.</p>
    <p>{d.fee===null?'Fee unavailable: complete, consistent input and output amounts are required.':'The fee is all inputs minus all outputs, paid in KAS. It is already included in the address decrease when this address funds the whole transaction. With multiple input addresses, this view cannot assign who paid the fee.'}</p>
    <h3>Recipients & outputs</h3>
    <p>Outputs show where native KAS goes. An output to the tracked address may be change or a self-transfer. Another address may also belong to the same wallet; this view cannot identify wallet ownership or the intended recipient.</p>
    <Parties rows={d.outputs} address={address} input={false}/>
    <details className="inputs"><summary>Show inputs ({d.inputs?.length??'unavailable'})</summary><Parties rows={d.inputs} address={address} input/></details>
    <p>GEEK is a KRC-20 token. This native KAS receipt does not establish a GEEK mint, transfer, burn, or learning reward. Check the token operation separately.</p>
    <p className="full-address">Transaction ID: {tx.id}</p>
    <a className="text-link" href={`https://explorer.kaspa.org/txs/${tx.id}`} target="_blank" rel="noopener noreferrer">Check transaction in explorer ↗</a>
   </div>
  </details>
 </li>;
}
