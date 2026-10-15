'use client';
import {useState} from 'react';
import {useReading} from '../useReading';
import {swapAssets,swapHandoff} from '../../swaps/catalog';
import type {SwapListing,SwapAssetId} from '../../swaps/catalog';

function Listings(){
 const [id,setId]=useState<SwapAssetId>('btc'),[direction,setDirection]=useState('from-kas');
 const result=useReading<SwapListing[]>('/api/swap-assets'),asset=swapAssets.find(a=>a.id===id)!;
 const listing=result.reading?.status==='available'?result.reading.value.find(row=>row.id===id):null;
 const available=listing&&(direction==='from-kas'?listing.fromKas:listing.toKas);
 return <>
  <div className="swap-fields"><label>Direction<select value={direction} onChange={e=>setDirection(e.target.value)}><option value="from-kas">KAS → another asset</option><option value="to-kas">Another asset → KAS</option></select></label>
   <label>Other asset & network<select value={id} onChange={e=>setId(e.target.value as SwapAssetId)}>{swapAssets.map(a=><option key={a.id} value={a.id}>{a.symbol} · {a.network}</option>)}</select></label></div>
  <div className="swap-pair"><span>{direction==='from-kas'?'KAS':asset.symbol}</span><span aria-hidden="true">→</span><span>{direction==='from-kas'?asset.symbol:'KAS'}</span></div>
  <p>KAS uses Kaspa Mainnet. {asset.symbol} uses <strong>{asset.network}</strong>.</p>
  {asset.id==='xrp'&&<p>Check whether the destination requires an XRP destination tag.</p>}
  <p role="status">{result.pending?'Checking the provider’s asset listing…':!listing?'Provider listing unavailable. Refresh or try again later.':available?'Both assets are listed by the provider. A live quote must confirm this exact route.':'The provider does not currently list both assets for this direction.'}</p>
  {available&&<a className="action-link primary-link" href={swapHandoff(id,direction)} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">Review {direction==='from-kas'?`KAS → ${asset.symbol}`:`${asset.symbol} → KAS`} on ChangeNOW ↗</a>}
  {result.reading?.status==='available'&&<p className="source-time">Asset listing checked {new Date(result.reading.checkedAt).toLocaleString()}. Listings are not quotes or proof of pair liquidity.</p>}
 </>;
}
export default function SwapPicker(){
 const [revision,setRevision]=useState(0);
 return <section className="panel swap-panel" aria-labelledby="choose-swap"><h2 id="choose-swap">Choose your pair</h2><Listings key={revision}/><button className="quiet" type="button" onClick={()=>setRevision(n=>n+1)}>Refresh provider listing</button></section>;
}
