'use client';
import {useEffect,useState} from 'react';
import type {Reading} from '../watch/provider';

type Result<T>={pending:boolean;reading:Reading<T>|null;error:string};
export function useReading<T>(url:string){
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

