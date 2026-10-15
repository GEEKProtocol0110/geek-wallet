const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const load=require('./load.cjs');const {normalizeAddress,baseUnits,displayUnits,parseKas,parseGeek,parseActivity,loadPortfolio}=load('src/watch/model.ts');
const kaspa=require('@dfns/kaspa-wasm');const pub=new kaspa.PublicKey('0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798');const main=pub.toAddress('mainnet'),other=pub.toAddress('testnet-10');const address=main.toString(),testnet=other.toString();pub.free();main.free();other.free();
test('SDK validates checksums, network and canonical case',()=>{assert.equal(normalizeAddress(' '+address.toUpperCase()+' '),address);for(const v of [testnet,address.slice(0,-1)+(address.endsWith('q')?'p':'q'),address.replace('kaspa','KaSpa'),'https://x',null,'x'.repeat(121)])assert.throws(()=>normalizeAddress(v));});
test('amounts remain exact beyond floating point precision',()=>{assert.equal(displayUnits('123456789123456789'),'1,234,567,891.23456789');assert.equal(displayUnits('1'),'0.00000001');assert.equal(displayUnits('0'),'0');for(const v of [Number.MAX_SAFE_INTEGER+1,-1,1.5,'01','1e8','Infinity',null])assert.throws(()=>baseUnits(v));assert.throws(()=>parseKas({address:'wrong',balance:0},address));});
test('only valid, complete specific-token responses can report zero',()=>{assert.deepEqual(parseGeek({message:'successful',result:[]}),{available:'0',locked:'0'});assert.deepEqual(parseGeek({message:'successful',result:[{tick:'GEEK',dec:'8',balance:'100000000',locked:'2'}]}),{available:'100000000',locked:'2'});for(const v of [{message:'failed',result:[]},{message:'successful',result:[],next:'more'},{message:'successful',result:[{tick:'GEEK',dec:'6',balance:'0',locked:'0'}]},{message:'successful',result:[{tick:'GEEK',dec:'8',balance:'0'}]}])assert.throws(()=>parseGeek(v));});
test('activity never invents IDs or acceptance',()=>{const id='a'.repeat(64);const [tx]=parseActivity([{transaction_id:id,block_time:1700000000000}],address);assert.equal(tx.id,id);assert.equal(tx.accepted,null);assert.equal(tx.time,1700000000000);assert.equal(tx.details.fee,null);assert.equal(tx.details.change,null);assert.throws(()=>parseActivity([{transaction_id:'https://wrong'}],address));assert.throws(()=>parseActivity([{transaction_id:id},{transaction_id:id}],address));});
test('public providers fail independently and use fixed GET endpoints',async()=>{const urls=[];const portfolio=await loadPortfolio(address,async(url,options)=>{urls.push(url);assert.equal(options.cache,'no-store');assert.equal(options.method,undefined);if(url.includes('kasplex')){assert.ok(url.includes('/address/kaspa:'));assert.ok(!url.includes('%3A'));assert.ok(url.endsWith('/token/GEEK'));assert.ok(!url.includes('tokenlist'));return new Response(JSON.stringify({message:'successful',result:[]}));}if(url.includes('full-transactions')){assert.equal(new URL(url).searchParams.get('resolve_previous_outpoints'),'light');return new Response('[]');}return new Response('offline',{status:503});});assert.equal(portfolio.kas.status,'unavailable');assert.equal(portfolio.kas.value,null);assert.equal(portfolio.geek.status,'available');assert.equal(portfolio.geek.value.available,'0');assert.equal('activity' in portfolio,false);assert.equal(urls.length,2);assert.ok(!urls.some(u=>u.includes('full-transactions')));assert.ok(urls.every(u=>['api.kaspa.org','api.kasplex.org'].includes(new URL(u).hostname)));});
test('invalid addresses cause no upstream calls; malformed bodies are unavailable',async()=>{let called=false;await assert.rejects(loadPortfolio(testnet,async()=>{called=true;}));assert.equal(called,false);const p=await loadPortfolio(address,async()=>new Response('{broken'));for(const field of ['kas','geek'])assert.equal(p[field].status,'unavailable');});
test('oversized provider responses are rejected',async()=>{const p=await loadPortfolio(address,async()=>new Response('{}',{headers:{'content-length':'1000001'}}));assert.equal(p.kas.status,'unavailable');assert.equal(p.geek.status,'unavailable');});
test('public experience has no key/signing imports or mock pricing',()=>{const page=fs.readFileSync('src/app/page.tsx','utf8');assert.ok(!/CreateWallet|RestoreWallet|wallet-store|privateKey|mnemonic/.test(page));for(const file of ['market-data','price-history'])assert.match(fs.readFileSync(`src/app/api/kaspa/${file}/route.ts`,'utf8'),/503/);});

const tokenRow={tick:'GEEK',dec:'8',balance:'111857677900000000',locked:'0'};
test('specific-token lookup finds GEEK when paginated holdings would hide it',async()=>{
 const urls=[];
 const p=await loadPortfolio(address,async url=>{
  urls.push(url);
  if(url.includes('kasplex')){
   // The old URL receives an unrelated first page even with tick=GEEK.
   const body=url.endsWith('/token/GEEK')?{message:'successful',result:[tokenRow]}:{message:'successful',prev:'ZEKU',next:'KASBOB',result:[{tick:'ZEKU',dec:'8',balance:'1',locked:'0'}]};
   return new Response(JSON.stringify(body));
  }
  return new Response(JSON.stringify(url.includes('full-transactions')?[]:{balance:0}));
 });
 assert.equal(p.geek.status,'available');assert.deepEqual(p.geek.value,{available:tokenRow.balance,locked:'0'});
 assert.equal(displayUnits(p.geek.value.available),'1,118,576,779');
 assert.equal(p.geek.source,`https://api.kasplex.org/v1/krc20/address/${address}/token/GEEK`);
 assert.equal(urls.filter(u=>u.includes('kasplex')).length,1);
});
test('specific-token parser rejects wrong tokens, malformed rows, duplicates and cursors even with a GEEK match',()=>{
 for(const result of [[{...tokenRow,tick:'OTHER'}],[null],[{}],[tokenRow,tokenRow],[tokenRow,{...tokenRow,tick:'OTHER'}]])assert.throws(()=>parseGeek({message:'successful',result}));
 for(const cursor of ['next','prev'])for(const value of ['KASBOB',42,{}])for(const result of [[],[tokenRow]])assert.throws(()=>parseGeek({message:'successful',result,[cursor]:value}));
 for(const field of ['balance','locked'])for(const value of [undefined,null,'',-1,'01','1e8',Number.MAX_SAFE_INTEGER+1])assert.throws(()=>parseGeek({message:'successful',result:[{...tokenRow,[field]:value}]}));
 assert.deepEqual(parseGeek({message:'successful',next:null,prev:'',result:[]}),{available:'0',locked:'0'});
 assert.deepEqual(parseGeek({message:'successful',result:[{...tokenRow,tick:'geek',dec:8,balance:'1',locked:'2'}]}),{available:'1',locked:'2'});
});
test('a failed or partial GEEK lookup stays unavailable while native readings survive',async()=>{
 for(const body of [null,{message:'failed',result:[]},{message:'successful',result:[],next:'more'},{message:'successful',result:[{...tokenRow,tick:'OTHER'}]}]){
  const p=await loadPortfolio(address,async url=>url.includes('kasplex')?(body===null?new Response('offline',{status:503}):new Response(JSON.stringify(body))):new Response(JSON.stringify(url.includes('full-transactions')?[]:{balance:0})));
  assert.equal(p.geek.status,'unavailable');assert.equal(p.geek.value,null);assert.equal(p.kas.status,'available');assert.equal('activity' in p,false);
 }
});
test('the observed Kasplex no-record sentinel reports zero only with explicit zero balances and operation score',()=>{
 const empty={tick:'GEEK',balance:'0',locked:'0',dec:'0',opScoreMod:'0'};
 assert.deepEqual(parseGeek({message:'successful',result:[empty]}),{available:'0',locked:'0'});
 for(const change of [{balance:'1'},{locked:'1'},{opScoreMod:'1'},{opScoreMod:undefined},{dec:'6'},{balance:undefined},{locked:undefined},{tick:'OTHER'}])assert.throws(()=>parseGeek({message:'successful',result:[{...empty,...change}]}));
});
