'use client';
import {useEffect,useState} from 'react';
import {displayUnits} from '../watch/amounts';
import type {Reading} from '../watch/provider';
import type {TokenPage} from '../watch/tokens';
import type {CovenantSnapshot} from '../watch/covenants';

type Result<T>={pending:boolean;reading:Reading<T>|null;error:string};
function useReading<T>(url:string){
 const [result,setResult]=useState<Result<T>>({pending:true,reading:null,error:''});
 useEffect(()=>{
  let active=true;const control=new AbortController(),timer=setTimeout(()=>control.abort(),15000);
  void fetch(url,{cache:'no-store',signal:control.signal}).then(async r=>{
   if(!r.ok)throw new Error('Lookup unavailable. Try again.');
   return await r.json() as Reading<T>;
  }).then(reading=>{if(active)setResult({pending:false,reading,error:''});}).catch(()=>{if(active)setResult({pending:false,reading:null,error:'Lookup unavailable or timed out. Try again.'});}).finally(()=>clearTimeout(timer));
  return()=>{active=false;clearTimeout(timer);control.abort();};
 },[url]);
 return result;
}

function KrcPage({address,cursor,onNext,onStart,onRetry,page}:{address:string;cursor:string|null;onNext:(cursor:string)=>void;onStart:()=>void;onRetry:()=>void;page:number}){
 const [filter,setFilter]=useState('');
 const url=`/api/tokens?address=${encodeURIComponent(address)}${cursor?`&cursor=${encodeURIComponent(cursor)}`:''}`;
 const result=useReading<TokenPage>(url);
 const r=result.reading;
 if(result.pending)return <p role="status">Reading KRC-20 holdings, page {page}…</p>;
 if(result.error||!r||r.status==='unavailable')return <div><p role="status">KRC-20 holdings unavailable. This is not a zero-token result.</p><button className="quiet" onClick={onRetry}>Retry this page</button>{page>1&&<button className="quiet" onClick={onStart}>Back to first page</button>}</div>;
 const rows=r.value.tokens.filter(t=>(t.symbol||t.id).toLowerCase().includes(filter.toLowerCase())||t.id.includes(filter.toLowerCase()));
 return <>
  <p className="source-time">Page {page} · {r.value.tokens.length} token records · Read {new Date(r.checkedAt).toLocaleString()} · Kasplex</p>
  <label className="token-filter">Find on this page<input value={filter} onChange={e=>setFilter(e.target.value)} maxLength={64} placeholder="Ticker or token ID"/></label>
  {r.value.tokens.length===0?<p>No token records returned on this page.</p>:rows.length===0?<p>No matches on this page. Other pages may contain the token.</p>:<ul className="token-cards">{rows.map(t=><li key={t.id}>
   <div className="token-title"><h3>{t.symbol||'Issue-mode token'}</h3><span>KRC-20</span></div>
   <dl><div><dt>Available</dt><dd>{displayUnits(t.available,t.decimals)}</dd></div><div><dt>Locked</dt><dd>{displayUnits(t.locked,t.decimals)}</dd></div></dl>
   <p>{t.decimals} decimals · Indexer-reported amounts</p>
   <details><summary>Token identity</summary><p className="full-address">{t.contract?'Contract ID':'Ticker'}: {t.id}</p></details>
  </li>)}</ul>}
  <div className="token-paging">{page>1&&<button className="quiet" onClick={onStart}>Back to first page</button>}{r.value.next?<button onClick={()=>onNext(r.value.next!)}>Next page →</button>:<p>End of this indexer listing.</p>}</div>
  <p className="token-note">This page is part of a changing indexer listing, not a complete wallet balance. GEEK also has its own direct lookup above, even when it appears on a later page.</p>
 </>;
}

export function KrcHoldings({address}:{address:string}){
 const [path,setPath]=useState<(string|null)[]>([null]),[message,setMessage]=useState(''),[revision,setRevision]=useState(0);
 function next(cursor:string){
  if(path.includes(cursor)){setMessage('The indexer repeated a page cursor. Refresh from the first page to read again.');return;}
  setMessage('');setPath([...path,cursor]);
 }
 function start(){setMessage('');setPath([null]);setRevision(v=>v+1);}
 return <section className="panel asset-section" id="assets" aria-labelledby="tokens-title">
  <span className="eyebrow">KASPA TOKEN ECOSYSTEM</span><h2 id="tokens-title">KRC-20 holdings</h2>
  <p>Explore tokens held by this address, with each token’s own precision. Names and tickers are labels, not endorsements.</p>
  {message&&<p role="status" className="status">{message}</p>}
  <KrcPage key={`${path.join(':')}:${revision}`} address={address} cursor={path[path.length-1]} onNext={next} onStart={start} onRetry={()=>setRevision(v=>v+1)} page={path.length}/>
 </section>;
}

function CovenantRead({address,onRetry}:{address:string;onRetry:()=>void}){
 const result=useReading<CovenantSnapshot>(`/api/covenants?address=${encodeURIComponent(address)}`);
 const r=result.reading;
 if(result.pending)return <p role="status">Reading experimental covenant-token snapshots…</p>;
 if(result.error||!r||r.status==='unavailable')return <div><p role="status">Covenant holdings unavailable. The source may be offline, stale, incomplete, or use an unsupported profile. No zero balance is inferred.</p><button className="quiet" onClick={onRetry}>Retry covenant lookup</button></div>;
 return <CovenantSnapshotView reading={r}/>;
}

export function CovenantSnapshotView({reading:r}:{reading:Extract<Reading<CovenantSnapshot>,{status:'available'}>}){
 const d=r.value;
 return <>
  <p className="source-time">Read {new Date(r.checkedAt).toLocaleString()} · kcc20.info · Source snapshots</p>
  {d.behind&&<p className="status" role="status">Indexer behind network. These snapshots may be outdated.</p>}
  {d.unresolved>0&&<p className="status" role="status">The source reports unresolved transitions. Holdings may be incomplete.</p>}
  {d.tokens.length===0?<p>No covenant-token holdings reported by this indexer snapshot. This does not establish that the address has no covenant assets.</p>:<ul className="token-cards">{d.tokens.map(t=><li key={t.id}>
   <div className="token-title"><h3>{t.name}</h3><span>{t.standard==='legacy-kcc20'?'Legacy KCC20 profile':'Kron Native profile'}</span></div>
   <dl><div><dt>Reported snapshot</dt><dd>{t.balance===null?'Unavailable':displayUnits(t.balance,t.decimals)}</dd></div></dl>
   <p>Source validation: {t.validation.replaceAll('_',' ')}. GEEK Wallet has not independently verified the covenant or ownership.</p>
   <details><summary>Token identity & source</summary><p className="full-address">Token / covenant ID: {t.id}</p><p>State source DAA: {t.sourceDaa.toLocaleString()} · {t.decimals} decimals</p><a className="text-link" href={`https://kcc20.info/tokens/${t.id}`} target="_blank" rel="noopener noreferrer">Inspect at source ↗</a></details>
  </li>)}</ul>}
  <details><summary>Indexer coverage & freshness</summary><p>Indexed DAA {d.indexedDaa.toLocaleString()} · Network DAA {d.networkDaa.toLocaleString()} · Lag {d.lagDaa.toLocaleString()} scores</p><p>Node checkpoint: {new Date(d.nodeUpdatedAt).toLocaleString()}. Owner type reported by source: {d.ownerType}.</p><p>This provider currently labels its profiles legacy-kcc20 and kron-native. They are separate from a claim of conformance to the current KCC-20 proposal. Source validation labels are the provider’s statements.</p><a className="text-link" href="https://kcc20.info/docs" target="_blank" rel="noopener noreferrer">Source API documentation ↗</a></details>
 </>;
}

export function CovenantHoldings({address}:{address:string}){
 const [revision,setRevision]=useState(0);
 return <section className="panel asset-section" id="covenants" aria-labelledby="covenants-title">
  <span className="eyebrow">COVENANT TOKENS · EXPERIMENTAL</span><h2 id="covenants-title">KCC-20 ecosystem</h2>
  <p>Inspect covenant-token snapshots separately from KAS and KRC-20. KCC-20 was in Last Call when reviewed on 14 October 2026. This experimental provider view does not certify conformance or spendability.</p>
  <CovenantRead key={revision} address={address} onRetry={()=>setRevision(v=>v+1)}/>
  <p className="token-note">Token names can be duplicated. Check the full token ID and source profile. Snapshot amounts are not added to KAS or GEEK balances.</p>
  <a className="text-link" href="https://github.com/kaspanet/kccs/blob/main/kcc-0020.md" target="_blank" rel="noopener noreferrer">Read the KCC-20 convention ↗</a>
 </section>;
}
