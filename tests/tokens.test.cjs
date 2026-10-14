const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./load.cjs');
const {parseTokenPage,tokenCursor}=load('src/watch/tokens.ts');
const {displayUnits}=load('src/watch/amounts.ts');
const {loadTokens,loadCovenants,normalizeAddress}=load('src/watch/model.ts');
const {parseCovenants}=load('src/watch/covenants.ts');
const address=normalizeAddress('kaspa:qzj0e55rlxpm0knvra9wvgckpkyq9h8hv8wl0lh2ngjad9a4cedmj24cy07ew');
const token={tick:'NACHO',balance:'123456789123456789',locked:'1',dec:'8'};
const row={token_id:'a'.repeat(64),standard:'legacy-kcc20',decimals:8,balance:'1000000',source_daa:100,validation_status:'verified',display_name:'Example covenant'};
const analysis=(rows=[row])=>({address,owner:'b'.repeat(64),owner_type:'wallet',summary:{token_count:rows.length},portfolio:rows});
const status=(now=Date.now())=>({max_daa:200,network_daa:220,unresolved_kcc20_transitions:0,capabilities:{balances:true},checkpoints:[{source:'node',updated_at:new Date(now).toISOString()}]});

test('token amounts use each asset precision including zero and eighteen decimals',()=>{
 assert.equal(displayUnits('1234567',0),'1,234,567');assert.equal(displayUnits('1',18),'0.000000000000000001');
 assert.equal(displayUnits('123456789123456789',8),'1,234,567,891.23456789');
 assert.equal(displayUnits('0',0),'0');
 for(const d of [-1,19,1.5,NaN,'8'])assert.throws(()=>displayUnits('1',d));
});

test('KRC-20 pages retain mint-mode tickers, issue-mode contract IDs, precision and cursors',()=>{
 const issue={ca:'c'.repeat(64),dec:'18',balance:'1',locked:'0'};
 const p=parseTokenPage({message:'successful',result:[token,issue],next:'KASBOB'});
 assert.equal(p.next,'KASBOB');assert.equal(p.tokens[0].id,'NACHO');assert.equal(p.tokens[0].available,token.balance);
 assert.equal(p.tokens[1].id,issue.ca);assert.equal(p.tokens[1].symbol,null);assert.equal(p.tokens[1].decimals,18);
 assert.deepEqual(parseTokenPage({message:'successful',result:[]}),{tokens:[],next:null});
});

test('malformed, ambiguous or incomplete pages do not become a zero-token result',()=>{
 for(const value of [{message:'failed',result:[]},{message:'successful',result:[],next:'KASBOB'},{message:'successful',result:[token,token]},{message:'successful',result:Array(101).fill(token)}])assert.throws(()=>parseTokenPage(value));
 for(const change of [{balance:null},{locked:undefined},{balance:Number.MAX_SAFE_INTEGER+1},{dec:'19'},{dec:'08'},{tick:'<script>'},{ca:'not-a-contract'},{tick:undefined}])assert.throws(()=>parseTokenPage({message:'successful',result:[{...token,...change}]}));
 for(const v of ['https://evil','../GEEK','GEEK&next=x','x'.repeat(65),42,{}])assert.throws(()=>tokenCursor(v));
 assert.equal(tokenCursor('a'.repeat(64)),'a'.repeat(64));
});

test('later KRC-20 pages follow only a validated cursor on the fixed provider',async()=>{
 const urls=[];
 const p=await loadTokens(address,'KASBOB',async(url,options)=>{urls.push(url);assert.equal(options.cache,'no-store');return new Response(JSON.stringify({message:'successful',result:[{...token,tick:'GEEK'}],next:'ANTX'}));});
 assert.equal(p.status,'available');assert.equal(p.value.tokens[0].symbol,'GEEK');
 assert.deepEqual(urls,[`https://api.kasplex.org/v1/krc20/address/${address}/tokenlist?next=KASBOB`]);
 const repeated=await loadTokens(address,'KASBOB',async()=>new Response(JSON.stringify({message:'successful',result:[token],next:'KASBOB'})));
 assert.equal(repeated.status,'unavailable');
 let calls=0;const fetcher=async()=>{calls++;throw Error('should not fetch');};
 await assert.rejects(loadTokens('bad',null,fetcher));await assert.rejects(loadTokens(address,'../GEEK',fetcher));assert.equal(calls,0);
 const failed=await loadTokens(address,null,async()=>new Response('rate limited',{status:429}));assert.equal(failed.status,'unavailable');assert.equal(failed.value,null);
});

test('covenant snapshots preserve provider profiles and source-only verification labels',()=>{
 const now=Date.now(),s=status(now);
 const d=parseCovenants(analysis([row,{...row,token_id:'c'.repeat(64),standard:'kron-native',decimals:0,validation_status:'template_verified',balance:'123'}]),s,address,now);
 assert.equal(d.tokens[0].standard,'legacy-kcc20');assert.equal(d.tokens[1].standard,'kron-native');assert.equal(d.tokens[1].decimals,0);
 assert.equal(d.tokens[0].balance,'1000000');assert.equal(d.tokens[1].validation,'template_verified');assert.equal(d.lagDaa,20);assert.equal(d.behind,false);
 const unverified=parseCovenants(analysis([{...row,validation_status:'unverified'}]),s,address,now);
 assert.equal(unverified.tokens[0].balance,null);
 assert.equal(parseCovenants(analysis([]),s,address,now).tokens.length,0);
});

test('behind or unresolved covenant sources are labeled; stale sources are unavailable',()=>{
 const now=Date.now(),s=status(now);
 const behind=parseCovenants(analysis(),{...s,network_daa:10000,unresolved_kcc20_transitions:2},address,now);
 assert.equal(behind.behind,true);assert.equal(behind.unresolved,2);
 for(const age of [900001,-300001])assert.throws(()=>parseCovenants(analysis(),{...s,checkpoints:[{source:'node',updated_at:new Date(now-age).toISOString()}]},address,now));
 for(const change of [{capabilities:{balances:false}},{network_daa:10},{max_daa:Number.MAX_SAFE_INTEGER+1},{checkpoints:[]},{unresolved_kcc20_transitions:-1}])assert.throws(()=>parseCovenants(analysis(),{...s,...change},address,now));
});

test('covenant owner, identity, coverage and profile mismatches never produce trusted balances',()=>{
 for(const change of [{address:'kaspa:wrong'},{owner:'not-an-owner'},{owner_type:'unknown'},{summary:{token_count:2}},{portfolio:[row,row]}])assert.throws(()=>parseCovenants({...analysis(),...change},status(),address));
 for(const change of [{standard:'KCC-20-final'},{standard:'krc20'},{balance:'1.2'},{decimals:19},{source_daa:300},{token_id:'https://evil'},{validation_status:null}])assert.throws(()=>parseCovenants(analysis([{...row,...change}]),status(),address));
});

test('covenant reads use bounded fixed GET sources, and failure of either source is unavailable',async()=>{
 const urls=[];
 const fetcher=async(url,options)=>{urls.push(url);assert.equal(options.cache,'no-store');assert.equal(options.method,undefined);return new Response(JSON.stringify(url.endsWith('/v1/status')?status():analysis()));};
 const d=await loadCovenants(address,fetcher);assert.equal(d.status,'available');assert.equal(urls.length,2);assert.ok(urls.every(u=>new URL(u).hostname==='kcc20.info'));
 const failed=await loadCovenants(address,async url=>url.endsWith('/v1/status')?new Response('offline',{status:503}):new Response(JSON.stringify(analysis())));assert.equal(failed.status,'unavailable');assert.equal(failed.value,null);
 let calls=0;await assert.rejects(loadCovenants('invalid',async()=>{calls++;}));assert.equal(calls,0);
});

test('token routes validate duplicate and unknown parameters before making requests and retain no-store',async()=>{
 const {NextRequest}=require('next/server');
 const routes=[['tokens',load('src/app/api/tokens/route.ts')],['covenants',load('src/app/api/covenants/route.ts')]];
 const original=global.fetch;let calls=0;
 global.fetch=async()=>{calls++;throw Error('No network allowed');};
 try{
  for(const [name,route] of routes)for(const q of ['','address=bad',`address=${address}&address=${address}`,`address=${address}&unknown=x`]){
   const r=await route.GET(new NextRequest(`https://wallet.example/api/${name}?${q}`));assert.equal(r.status,400);assert.equal(r.headers.get('cache-control'),'no-store');
  }
  const route=routes[0][1];for(const q of [`address=${address}&cursor=../x`,`address=${address}&cursor=GEEK&cursor=ANTX`])assert.equal((await route.GET(new NextRequest(`https://wallet.example/api/tokens?${q}`))).status,400);
  assert.equal(calls,0);
  global.fetch=async url=>new Response(JSON.stringify(url.includes('kasplex')?{message:'successful',result:[token]}:url.endsWith('/v1/status')?status():analysis()));
  for(const [name,route] of routes){const r=await route.GET(new NextRequest(`https://wallet.example/api/${name}?address=${address}`));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).status,'available');}
 }finally{global.fetch=original;}
});

test('rendered balances put native KAS first and keep GEEK featured without adding unlike units',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),Balances=load('src/app/PortfolioBalances.tsx').default;
 const reading=value=>({status:'available',value,source:'test',checkedAt:1700000000000});
 const html=renderToStaticMarkup(React.createElement(Balances,{portfolio:{address,network:'mainnet',kas:reading('123000000'),geek:reading({available:'10000000000',locked:'0'}),activity:reading([])}}));
 assert.ok(html.indexOf('Kaspa (KAS)')<html.indexOf('>GEEK<'));assert.match(html,/FEATURED ASSET/);assert.match(html,/1.23/);assert.match(html,/network fees/);assert.match(html,/Token units stay separate/);
});

test('rendered covenant snapshots expose profile, lag, uncertainty, token identity and unverified amounts safely',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const {CovenantSnapshotView}=load('src/app/TokenHoldings.tsx');
 const value=parseCovenants(analysis([{...row,display_name:'<img src=x onerror=alert(1)>'},{...row,token_id:'c'.repeat(64),standard:'kron-native',balance:'9999999',validation_status:'unverified'}]),{...status(),network_daa:10000,unresolved_kcc20_transitions:1},address);
 const html=renderToStaticMarkup(React.createElement(CovenantSnapshotView,{reading:{status:'available',value,checkedAt:Date.now(),source:'https://kcc20.info'}}));
 for(const text of ['Legacy KCC20 profile','Kron Native profile','Indexer behind network','unresolved transitions','not independently verified','Reported snapshot','Unavailable',row.token_id,'0.01'])assert.ok(html.includes(text),text);
 assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img'));assert.ok(!html.includes('0.09999999'));
 const empty=renderToStaticMarkup(React.createElement(CovenantSnapshotView,{reading:{status:'available',value:parseCovenants(analysis([]),status(),address),checkedAt:Date.now(),source:'https://kcc20.info'}}));
 assert.match(empty,/does not establish that the address has no covenant assets/);
});
