const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./load.cjs');
const {normalizeAddress,loadActivity,loadTokenActivity,loadPortfolio}=load('src/watch/model.ts');
const {parseTokenActivity}=load('src/watch/token-activity.ts');
const {swapAssets,parseSwapListings,swapHandoff,loadSwapListings}=load('src/swaps/catalog.ts');
const address=normalizeAddress('kaspa:qzj0e55rlxpm0knvra9wvgckpkyq9h8hv8wl0lh2ngjad9a4cedmj24cy07ew');
const other=normalizeAddress('kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e');
const operation={p:'KRC-20',op:'mint',tick:'GEEK',amt:'10000000000000',from:address,to:address,hashRev:'a'.repeat(64),opScore:'5630651440000',txAccept:'1',opAccept:'1',mtsAdd:'1791726793249'};
const response=(rows=[operation],extra={})=>({message:'successful',result:rows,...extra});
const parse=value=>parseTokenActivity(value,address,'GEEK',normalizeAddress);
test('opening the portfolio fetches only balances; native history is a separate requested reading',async()=>{
 const urls=[];const fetcher=async url=>{urls.push(url);return new Response(JSON.stringify(url.includes('kasplex')?{message:'successful',result:[]}:url.includes('full-transactions')?[]:{balance:0}));};
 const p=await loadPortfolio(address,fetcher);assert.equal('activity' in p,false);assert.equal(urls.length,2);assert.ok(!urls.some(u=>u.includes('full-transactions')));
 const r=await loadActivity(address,fetcher);assert.equal(r.status,'available');assert.ok(urls[2].includes('full-transactions?limit=20&resolve_previous_outpoints=light'));
});
test('token history preserves exact base units and independent acceptance without inferring native receipts',()=>{
 const first=parse(response()).operations[0];assert.equal(first.amount,operation.amt);assert.equal(first.transactionAccepted,true);assert.equal(first.operationAccepted,true);
 const rejected=parse(response([{...operation,opAccept:'0',opError:'Token amount invalid'}])).operations[0];assert.equal(rejected.operationAccepted,false);assert.equal(rejected.transactionAccepted,true);
 const unknown=parse(response([{...operation,txAccept:undefined,opAccept:'unknown',mtsAdd:'9999999999999999'}])).operations[0];assert.equal(unknown.transactionAccepted,null);assert.equal(unknown.operationAccepted,null);assert.equal(unknown.time,null);
});
test('unrelated addresses, wrong tokens, contracts, malformed records and duplicate operations fail closed',()=>{
 for(const patch of [{tick:'OTHER'},{from:other,to:other},{ca:'b'.repeat(64)},{amt:'1e8'},{hashRev:'url'},{opScore:'../x'},{op:'<img>'},{from:'kaspa:bad'}])assert.throws(()=>parse(response([{...operation,...patch}])));
 for(const v of [null,{message:'failed',result:[]},response([operation,operation]),response([],{next:'123'}),response([operation],{next:'http://x'}),response(Array(101).fill(operation))])assert.throws(()=>parse(v));
 assert.deepEqual(parse(response([])),{operations:[],next:null});
});
test('selected ticker and cursor stay on the fixed source; ignored filters and repeated cursors are unavailable',async()=>{
 let calls=0;const r=await loadTokenActivity(address,'geek','100',async(url,options)=>{calls++;const u=new URL(url);assert.equal(u.origin,'https://api.kasplex.org');assert.equal(u.pathname,'/v1/krc20/oplist');assert.equal(u.searchParams.get('address'),address);assert.equal(u.searchParams.get('tick'),'GEEK');assert.equal(u.searchParams.get('next'),'100');assert.equal(options.cache,'no-store');return new Response(JSON.stringify(response([operation],{next:'99'})));});
 assert.equal(r.status,'available');assert.equal(calls,1);
 for(const body of [response([{...operation,tick:'OTHER'}]),response([operation],{next:'100'})])assert.equal((await loadTokenActivity(address,'GEEK','100',async()=>new Response(JSON.stringify(body)))).status,'unavailable');
 for(const args of [[address,'BAD!',null],[address,'GEEK','../x'],['not-an-address','GEEK',null]])await assert.rejects(loadTokenActivity(...args,async()=>{throw new Error('Must not fetch');}));
});
const catalog=()=>[{ticker:'kas',network:'kas',legacyTicker:'kas',tokenContract:null,buy:true,sell:true},...swapAssets.map(a=>({ticker:a.symbol.toLowerCase(),network:a.providerNetwork,legacyTicker:a.legacyTicker,tokenContract:a.contract||null,buy:true,sell:true}))];
test('swap listings retain chain and token identity, fail closed on ambiguity and respect direction availability',()=>{
 const data=catalog();assert.equal(parseSwapListings(data).length,10);assert.ok(parseSwapListings(data).every(x=>x.fromKas&&x.toKas));
 data[0].sell=false;assert.ok(parseSwapListings(data).every(x=>!x.fromKas&&x.toKas));
 for(const patch of [{network:'trx'},{tokenContract:'0xwrong'}]){
  const rows=catalog();Object.assign(rows.find(r=>r.ticker==='usdt'),patch);
  if(patch.network)assert.equal(parseSwapListings(rows).find(r=>r.id==='usdt-eth').fromKas,false);else assert.throws(()=>parseSwapListings(rows));
 }
 const rows=catalog();rows.push({...rows[1]});assert.throws(()=>parseSwapListings(rows));assert.throws(()=>parseSwapListings({}));
});
test('provider links only contain allowlisted pair codes, never addresses, amounts or orders',async()=>{
 for(const a of swapAssets)for(const direction of ['from-kas','to-kas']){const u=new URL(swapHandoff(a.id,direction));assert.equal(u.origin,'https://changenow.io');assert.equal(u.pathname,'/exchange');assert.deepEqual([...u.searchParams.keys()],['from','to']);assert.equal(u.searchParams.get(direction==='from-kas'?'to':'from'),a.legacyTicker);}
 for(const id of ['GEEK','https://x','btc&address=x'])assert.throws(()=>swapHandoff(id,'from-kas'));assert.throws(()=>swapHandoff('btc','bad'));
 const r=await loadSwapListings(async(url,options)=>{assert.ok(url.startsWith('https://api.changenow.io/v2/exchange/currencies?'));assert.equal(options.method,undefined);return new Response('offline',{status:503});});assert.equal(r.status,'unavailable');
});
test('history and swap routes reject ambiguous input before upstream calls and return no-store',async()=>{
 const {NextRequest}=require('next/server'),native=load('src/app/api/activity/route.ts'),token=load('src/app/api/token-activity/route.ts'),swap=load('src/app/api/swap-assets/route.ts');
 const original=global.fetch;let calls=0;global.fetch=async()=>{calls++;throw new Error('Unexpected request');};
 try{
  for(const [route,queries] of [[native,['',`address=${address}&address=${address}`,`address=${address}&ticker=GEEK`,'address=bad']],[token,[`address=${address}`,`address=${address}&ticker=GEEK&ticker=OTHER`,`address=${address}&ticker=GEEK&cursor=../x`,`address=${address}&ticker=GEEK&url=https://x`]],[swap,['address=anything']]])for(const q of queries){const r=await route.GET(new NextRequest(`https://wallet.example/api/test?${q}`));assert.equal(r.status,400);assert.equal(r.headers.get('cache-control'),'no-store');}
  assert.equal(calls,0);global.fetch=async url=>new Response(JSON.stringify(url.includes('changenow')?catalog():url.includes('kasplex')?response():[]));
  for(const [route,q] of [[native,`address=${address}`],[token,`address=${address}&ticker=GEEK`],[swap,'']]){const r=await route.GET(new NextRequest(`https://wallet.example/api/test${q?'?'+q:''}`));assert.equal(r.status,200);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal((await r.json()).status,'available');}
 }finally{global.fetch=original;}
});
test('the first portfolio view has asset actions and no transaction feed; selections mount only their own history',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server'),{default:Overview,AssetDetails}=load('src/app/AssetPortfolio.tsx');
 const reading=value=>({status:'available',value,source:'fixture',checkedAt:1700000000000});
 const html=renderToStaticMarkup(React.createElement(Overview,{portfolio:{address,network:'mainnet',kas:reading('100'),geek:reading({available:'100',locked:'0'})}}));
 assert.match(html,/Select a coin or token/);assert.match(html,/View KAS/);assert.match(html,/View GEEK/);assert.ok(!html.includes('Reading KAS transactions'));assert.ok(!html.includes('Recent native activity'));assert.ok(!html.includes('Explain transaction'));
 const kas=renderToStaticMarkup(React.createElement(AssetDetails,{address,asset:{kind:'native',id:'KAS',name:'Kaspa'},onClose:()=>{}}));assert.match(kas,/Reading KAS transactions/);assert.ok(!kas.includes('Reading GEEK operations'));
 const geek=renderToStaticMarkup(React.createElement(AssetDetails,{address,asset:{kind:'krc20',id:'GEEK',name:'GEEK',decimals:8,contract:null},onClose:()=>{}}));assert.match(geek,/Reading GEEK operations/);assert.ok(!geek.includes('Reading KAS transactions'));
 const covenant=renderToStaticMarkup(React.createElement(AssetDetails,{address,asset:{kind:'covenant',id:'a'.repeat(64),name:'Example'},onClose:()=>{}}));assert.match(covenant,/not available in GEEK Wallet yet/);assert.ok(!covenant.includes('Reading KAS transactions'));
});
