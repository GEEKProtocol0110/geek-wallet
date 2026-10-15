'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import PortfolioBalances from './PortfolioBalances';
import TransactionActivity from './TransactionActivity';
import {CovenantHoldings,KrcHoldings} from './TokenHoldings';
import {useReading} from './useReading';
import {displayUnits} from '../watch/amounts';
import type {Activity,Portfolio} from '../watch/model';
import type {SelectedAsset} from '../watch/assets';
import type {TokenActivityPage} from '../watch/token-activity';

function NativeHistory({address}:{address:string}){
 const {pending,reading:r,error}=useReading<Activity[]>(`/api/activity?address=${encodeURIComponent(address)}`);
 const [visible,setVisible]=useState(5);
 if(pending)return <p role="status">Reading KAS transactions…</p>;
 if(error||!r||r.status==='unavailable')return <p role="status">KAS transactions unavailable. Retry or check the address in the explorer.</p>;
 return <><p className="source-time">Read {new Date(r.checkedAt).toLocaleString()} · Kaspa REST · Up to 20 recent transactions for this address.</p>
  {r.value.length===0?<p>No recent KAS transactions returned. This is not a complete wallet history.</p>:<><ul className="activity">{r.value.slice(0,visible).map(tx=><TransactionActivity key={tx.id} tx={tx} address={address}/>)}</ul>{visible<r.value.length&&<button type="button" className="quiet" onClick={()=>setVisible(n=>n+5)}>Show 5 more KAS transactions</button>}</>}
  <p className="token-note">These are native KAS receipts. Token transfers, mints and burns have their own operation records.</p>
 </>;
}

function TokenHistory({address,asset,cursor,onNext}:{address:string;asset:Extract<SelectedAsset,{kind:'krc20'}>;cursor:string|null;onNext:(value:string)=>void}){
 const {pending,reading:r,error}=useReading<TokenActivityPage>(`/api/token-activity?address=${encodeURIComponent(address)}&ticker=${encodeURIComponent(asset.id)}${cursor?`&cursor=${cursor}`:''}`);
 const [visible,setVisible]=useState(5);
 if(pending)return <p role="status">Reading {asset.name} operations…</p>;
 if(error||!r||r.status==='unavailable')return <p role="status">{asset.name} operations unavailable. No native KAS transactions are substituted.</p>;
 return <><p className="source-time">Read {new Date(r.checkedAt).toLocaleString()} · Kasplex · Recent token operations for this address.</p>
  {!r.value.operations.length?<p>No operations returned on this page. This is not proof of a complete token history.</p>:<ul className="activity token-operations">{r.value.operations.slice(0,visible).map(op=><li key={`${op.id}:${op.score}`}>
   <div className="transaction-top"><strong>{op.operation.toUpperCase()} · {asset.name}</strong><span className={`acceptance ${op.transactionAccepted===true&&op.operationAccepted===true?'accepted':''}`}>{op.operationAccepted===false?'Operation not accepted':op.transactionAccepted===false?'Transaction not accepted':op.operationAccepted===true&&op.transactionAccepted===true?'Accepted by source':'Acceptance unavailable'}</span></div>
   <p className="transaction-amount">{op.amount===null?'Amount unavailable':`${displayUnits(op.amount,asset.decimals)} ${asset.name}`}</p>
   <p className="source-time">Reported operation amount{op.time?` · Indexed ${new Date(op.time).toLocaleString()}`:''}</p>
   <details><summary>Operation details</summary><p>Token: {asset.id} · KRC-20 on Kaspa Mainnet</p><p>Amounts describe this operation, not a current balance or a promised payout. Acceptance is reported by Kasplex.</p>{op.from&&<p className="full-address">From: {op.from}</p>}{op.to&&<p className="full-address">To: {op.to}</p>}{op.error&&<p>Source error: {op.error}</p>}<p className="full-address">Reveal transaction: {op.id}</p><a className="text-link" href={`https://explorer.kaspa.org/txs/${op.id}`} target="_blank" rel="noopener noreferrer">Inspect native reveal transaction ↗</a></details>
  </li>)}</ul>}
  {visible<r.value.operations.length?<button type="button" className="quiet" onClick={()=>setVisible(n=>n+5)}>Show 5 more operations</button>:r.value.next&&<button type="button" className="quiet" onClick={()=>onNext(r.value.next!)}>Next operation page →</button>}
  <p className="token-note">A changing indexer listing can be incomplete. Reveal transactions and token operations have separate acceptance states.</p>
 </>;
}

export function AssetDetails({address,asset,onClose}:{address:string;asset:SelectedAsset;onClose:()=>void}){
 const [revision,setRevision]=useState(0),[cursors,setCursors]=useState<(string|null)[]>([null]),[message,setMessage]=useState('');
 function refresh(){setRevision(n=>n+1);setCursors([null]);setMessage('');}
 function next(cursor:string){if(cursors.includes(cursor)){setMessage('The source repeated a cursor. Refresh to restart.');return;}setCursors([...cursors,cursor]);}
 return <section className="panel asset-section asset-detail" aria-labelledby="asset-detail-title">
  <div className="section-head"><div><span className="eyebrow">{asset.kind==='native'?'NATIVE COIN':asset.kind==='krc20'?'KRC-20 TOKEN':'EXPERIMENTAL COVENANT TOKEN'}</span><h2 id="asset-detail-title">{asset.name} · Transactions</h2></div><button type="button" className="quiet" onClick={onClose}>← Back to assets</button></div>
  {asset.kind==='native'?<><div className="asset-actions"><button type="button" className="quiet" onClick={refresh}>Refresh KAS history</button><Link className="action-link" href="/swap">Swap KAS with major crypto ↗</Link></div><NativeHistory key={revision} address={address}/><a className="text-link" href={`https://explorer.kaspa.org/addresses/${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">Check this address in the explorer ↗</a></>:asset.kind==='krc20'&&!asset.contract?<><div className="asset-actions"><button type="button" className="quiet" onClick={refresh}>Refresh token history</button>{cursors.length>1&&<button type="button" className="quiet" onClick={refresh}>Back to first page</button>}{asset.id==='GEEK'&&<a className="text-link" href="https://www.geekprotocol.xyz/mint/">Explore GEEK minting ↗</a>}</div>{message&&<p role="status">{message}</p>}<TokenHistory key={`${revision}:${cursors.join(':')}`} address={address} asset={asset} cursor={cursors[cursors.length-1]} onNext={next}/></>:<><p>Transaction history for this {asset.kind==='covenant'?'covenant profile':'issue-mode contract'} is not available in GEEK Wallet yet. The holdings snapshot does not establish a transaction history.</p><p className="full-address">Token identity: {asset.id}</p>{asset.kind==='covenant'&&<a className="text-link" href={`https://kcc20.info/tokens/${asset.id}`} target="_blank" rel="noopener noreferrer">Inspect token at source ↗</a>}</>}
 </section>;
}

export default function AssetPortfolio({portfolio}:{portfolio:Portfolio}){
 const [selected,setSelected]=useState<SelectedAsset|null>(null);
 const details=useRef<HTMLDivElement>(null),overview=useRef<HTMLHeadingElement>(null);
 function select(asset:SelectedAsset){setSelected(asset);requestAnimationFrame(()=>{details.current?.focus();details.current?.scrollIntoView({block:'start'});});}
 function close(){setSelected(null);overview.current?.focus();overview.current?.scrollIntoView({block:'start'});}
 return <><div className="section-head portfolio-heading"><div><h2 ref={overview} tabIndex={-1}>Your assets</h2><p>Select a coin or token to see its transactions.</p></div><Link className="action-link" href="/swap">Explore swaps ↗</Link></div>
  <PortfolioBalances portfolio={portfolio} onSelect={select}/>
  <div id="asset-detail" className="detail-anchor" ref={details} tabIndex={-1}>{selected&&<AssetDetails key={`${portfolio.address}:${selected.kind}:${selected.id}`} address={portfolio.address} asset={selected} onClose={close}/>}</div>
  <KrcHoldings address={portfolio.address} onSelect={select}/><CovenantHoldings address={portfolio.address} onSelect={select}/>
 </>;
}
