import {readSource} from '../watch/provider';

// Ten major liquid assets, not a live market-cap ranking. Keep network identity explicit.
export const swapAssets=[
 {id:'btc',symbol:'BTC',name:'Bitcoin',network:'Bitcoin',providerNetwork:'btc',legacyTicker:'btc'},
 {id:'eth',symbol:'ETH',name:'Ethereum',network:'Ethereum',providerNetwork:'eth',legacyTicker:'eth'},
 {id:'usdt-eth',symbol:'USDT',name:'Tether',network:'Ethereum · ERC-20',providerNetwork:'eth',legacyTicker:'usdterc20',contract:'0xdac17f958d2ee523a2206206994597c13d831ec7'},
 {id:'bnb',symbol:'BNB',name:'BNB',network:'BNB Smart Chain',providerNetwork:'bsc',legacyTicker:'bnbbsc'},
 {id:'xrp',symbol:'XRP',name:'XRP',network:'XRP Ledger',providerNetwork:'xrp',legacyTicker:'xrp'},
 {id:'usdc-eth',symbol:'USDC',name:'USDC',network:'Ethereum · ERC-20',providerNetwork:'eth',legacyTicker:'usdc',contract:'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'},
 {id:'sol',symbol:'SOL',name:'Solana',network:'Solana',providerNetwork:'sol',legacyTicker:'sol'},
 {id:'trx',symbol:'TRX',name:'TRON',network:'TRON',providerNetwork:'trx',legacyTicker:'trx'},
 {id:'zec',symbol:'ZEC',name:'Zcash',network:'Zcash',providerNetwork:'zec',legacyTicker:'zec'},
 {id:'doge',symbol:'DOGE',name:'Dogecoin',network:'Dogecoin',providerNetwork:'doge',legacyTicker:'doge'},
] as const;
export type SwapAssetId=typeof swapAssets[number]['id'];
export type SwapListing={id:SwapAssetId;fromKas:boolean;toKas:boolean};
export const swapSource='https://api.changenow.io/v2/exchange/currencies?active=true&flow=standard';
export function parseSwapListings(value:unknown):SwapListing[]{
 if(!Array.isArray(value)||value.length>5000)throw new Error('Invalid provider catalog');
 const find=(ticker:string,network:string,legacy:string,contract:string|null=null)=>{
  const rows=value.filter(r=>r&&typeof r==='object'&&r.ticker===ticker&&r.network===network);
  if(rows.length>1)throw new Error('Ambiguous asset network');const row=rows[0];
  if(!row)return {buy:false,sell:false};
  if(row.legacyTicker!==legacy||typeof row.buy!=='boolean'||typeof row.sell!=='boolean'||(row.tokenContract===null?null:typeof row.tokenContract==='string'?row.tokenContract.toLowerCase():undefined)!==contract)throw new Error('Invalid listing');
  return {buy:row.buy,sell:row.sell};
 };
 const kas=find('kas','kas','kas');
 return swapAssets.map(asset=>{const row=find(asset.symbol.toLowerCase(),asset.providerNetwork,asset.legacyTicker,'contract' in asset?asset.contract:null);return {id:asset.id,fromKas:kas.sell&&row.buy,toKas:row.sell&&kas.buy};});
}
export function loadSwapListings(fetcher:typeof fetch=fetch){return readSource(swapSource,parseSwapListings,fetcher);}
export function swapHandoff(id:string,direction:string):string{
 const asset=swapAssets.find(a=>a.id===id);if(!asset||!['from-kas','to-kas'].includes(direction))throw new Error('Unsupported swap selection');
 const url=new URL('https://changenow.io/exchange');
 url.searchParams.set('from',direction==='from-kas'?'kas':asset.legacyTicker);
 url.searchParams.set('to',direction==='from-kas'?asset.legacyTicker:'kas');
 return url.toString();
}
