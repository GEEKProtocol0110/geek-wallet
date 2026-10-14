export type Reading<T> = {status:'available';value:T;source:string;checkedAt:number} | {status:'unavailable';value:null;source:string;checkedAt:number};

export async function providerJson(url:string,fetcher:typeof fetch,signal:AbortSignal):Promise<unknown>{
 const r=await fetcher(url,{headers:{Accept:'application/json'},cache:'no-store',signal});
 if(!r.ok)throw new Error('Source unavailable');
 const length=Number(r.headers.get('content-length'));if(length>1000000)throw new Error('Response too large');
 const raw=await r.text();if(raw.length>1000000)throw new Error('Response too large');return JSON.parse(raw) as unknown;
}

export async function readSource<T>(source:string,parse:(value:unknown)=>T,fetcher:typeof fetch=fetch):Promise<Reading<T>>{
 const control=new AbortController(),timer=setTimeout(()=>control.abort(),10000);
 try{return {status:'available',value:parse(await providerJson(source,fetcher,control.signal)),source,checkedAt:Date.now()};}
 catch{return {status:'unavailable',value:null,source,checkedAt:Date.now()};}
 finally{clearTimeout(timer);}
}
