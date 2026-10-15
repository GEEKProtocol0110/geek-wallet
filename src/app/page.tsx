'use client';
import {useEffect,useRef,useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import AssetPortfolio from './AssetPortfolio';
import type {Portfolio} from '@/watch/model';
type SavedAddress={address:string;name:string};
const savedKey='geek_watch_addresses_v1';
export default function Home(){
 const [address,setAddress]=useState(''),[name,setName]=useState(''),[remember,setRemember]=useState(false);
 const [saved,setSaved]=useState<SavedAddress[]>([]),[portfolio,setPortfolio]=useState<Portfolio|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[qr,setQr]=useState('');
 const request=useRef<AbortController|null>(null),sequence=useRef(0);
 useEffect(()=>{const timer=setTimeout(()=>{try{const v=JSON.parse(localStorage.getItem(savedKey)||'[]');if(Array.isArray(v))setSaved(v.filter(r=>r&&typeof r.address==='string'&&/^kaspa:[a-z0-9]{50,100}$/.test(r.address)&&typeof r.name==='string'&&r.name.length<=30).slice(0,6));}catch{}},0);return()=>{clearTimeout(timer);request.current?.abort();};},[]);
 useEffect(()=>{let live=true;const timer=setTimeout(()=>{setQr('');if(portfolio)void QRCode.toDataURL(portfolio.address,{width:232,margin:2,errorCorrectionLevel:'M'}).then(url=>{if(live)setQr(url);}).catch(()=>{});},0);return()=>{live=false;clearTimeout(timer);};},[portfolio]);
 function keep(list:SavedAddress[]){setSaved(list);try{localStorage.setItem(savedKey,JSON.stringify(list));return true;}catch{setMessage('Tracking works for this visit, but this browser could not save the address list.');return false;}}
 async function track(raw=address,saveAddress=remember){
  request.current?.abort();const control=new AbortController();request.current=control;const run=++sequence.current;const timer=setTimeout(()=>control.abort(),15000);
  setBusy(true);setMessage('');setPortfolio(null);
  try{
   const r=await fetch(`/api/portfolio?address=${encodeURIComponent(raw.trim())}`,{cache:'no-store',signal:control.signal});const body=await r.json();if(!r.ok)throw new Error(body.error||'Address lookup unavailable.');if(sequence.current!==run)return;
   const data=body as Portfolio;setPortfolio(data);setAddress(data.address);
   if(saveAddress){const list=saved.filter(s=>s.address!==data.address);if(list.length>=6)setMessage('Six addresses are already saved. Remove one from the saved list to remember another.');else keep([...list,{address:data.address,name:name.trim().slice(0,30)||'Tracked address'}]);}
  }catch(error){if(sequence.current===run)setMessage(control.signal.aborted?'Lookup timed out. Try again when you are ready.':(error as Error).message);}
  finally{clearTimeout(timer);if(sequence.current===run)setBusy(false);}
 }
 async function copy(){if(!portfolio)return;try{await navigator.clipboard.writeText(portfolio.address);setMessage('Public address copied.');}catch{setMessage('Copy unavailable. Select the public address below.');}}
 return <><header className="header"><Link className="brand" href="/">GEEK<span>{'// WALLET'}</span></Link><nav aria-label="Main navigation"><Link href="/swap">Swap</Link><a href={portfolio?'#assets':'#track-title'}>KRC-20</a><a href={portfolio?'#covenants':'#track-title'}>KCC-20</a><a href="https://www.geekprotocol.xyz/">HQ ↗</a></nav></header><main>
 <section className="hero"><span className="eyebrow">KASPA MAINNET · PUBLIC-ADDRESS TRACKING</span><h1>Kaspa first.<br/><em>Your assets, together.</em></h1><p>Start with KAS, explore KRC-20 tokens, and inspect experimental covenant-token snapshots. GEEK is a featured asset in your Kaspa portfolio.</p><div className="pill">Public Alpha · Address tracking · No keys or signing</div></section>
 <section className="panel lookup" aria-labelledby="track-title"><h2 id="track-title">Track a public address</h2><p>Paste a Mainnet receiving address. Looking it up sends that public address to Kaspa REST, Kasplex and the kcc20.info covenant indexer. A single address may represent only part of a wallet with multiple receiving or change addresses.</p><form onSubmit={e=>{e.preventDefault();void track();}}><label>Public Kaspa address<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="kaspa:…" maxLength={120} autoComplete="off" spellCheck={false} required /></label><div className="form-row"><label>Local nickname <span>(optional)</span><input value={name} onChange={e=>setName(e.target.value)} maxLength={30} autoComplete="off" placeholder="My Kaspa address" /></label><button disabled={busy||!address.trim()}>{busy?'Reading sources…':'View portfolio →'}</button></div><label className="check"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/>Remember this address on this device</label></form><p role="status" aria-live="polite" className="status">{message}</p>
 {saved.length>0&&<div className="saved"><h3>Saved on this device</h3>{saved.map(item=><div key={item.address}><button type="button" disabled={busy} onClick={()=>{setRemember(false);setName(item.name);void track(item.address,false);}}>{item.name}<small>{item.address.slice(0,15)}…{item.address.slice(-8)}</small></button><button type="button" className="quiet" onClick={()=>keep(saved.filter(v=>v.address!==item.address))} aria-label={`Forget ${item.name}`}>Forget</button></div>)}</div>}</section>
 {portfolio&&<><AssetPortfolio key={portfolio.address} portfolio={portfolio}/> <details className="panel receive receive-drawer"><summary>Show Kaspa receiving address & QR</summary><span className="eyebrow">RECEIVING ADDRESS</span><h2 id="receive-title">Your Kaspa address.</h2>{qr&&<Image unoptimized src={qr} alt="QR code containing the tracked public Kaspa address" width={232} height={232}/>}<label>Public address<textarea readOnly value={portfolio.address} onFocus={e=>e.currentTarget.select()}/></label><button type="button" onClick={copy}>Copy public address</button><p>Tracking an address does not prove ownership. Verify it in your own wallet before someone sends funds.</p></details></>}
 <section className="next"><h2>A Kaspa wallet, built outward.</h2><p>KAS first. GEEK featured. The wider Kaspa token ecosystem belongs here.</p><a href="https://www.geekprotocol.xyz/study/?topic=wallets&level=foundations">Understand wallets & change ↗</a><a href="https://www.geekprotocol.xyz/mint/">Mint GEEK with Kasware ↗</a></section></main><footer>GEEK Wallet · Kaspa first · Public Alpha portfolio companion. Earlier experimental wallet code is retained for development; it is not part of this public experience.</footer></>;
}
