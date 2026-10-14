import {displayUnits} from '../watch/amounts';
import type {Portfolio} from '../watch/model';

export default function PortfolioBalances({portfolio}:{portfolio:Portfolio}){
 return <section className="balances" aria-label="Kaspa address balances">
  <article className="panel balance native-balance">
   <span className="eyebrow">KASPA · NATIVE COIN</span><h2>Kaspa (KAS)</h2>
   <strong>{portfolio.kas.status==='available'?displayUnits(portfolio.kas.value):'Unavailable'}<small>KAS</small></strong>
   <p>{portfolio.kas.status==='available'?`Read ${new Date(portfolio.kas.checkedAt).toLocaleTimeString()} · Kaspa REST`:'The native balance source could not be read. This is not a zero-balance result.'}</p>
   <p>KAS is the native coin of Kaspa and pays network fees. Token units stay separate from this balance.</p>
  </article>
  <article className="panel balance featured-token">
   <span className="eyebrow">FEATURED ASSET · KRC-20</span><h2>GEEK</h2>
   <strong>{portfolio.geek.status==='available'?displayUnits(portfolio.geek.value.available):'Unavailable'}</strong>
   <p>{portfolio.geek.status==='available'?`${displayUnits(portfolio.geek.value.locked)} GEEK locked · Read ${new Date(portfolio.geek.checkedAt).toLocaleTimeString()} · Kasplex`:'The GEEK source could not be read. Other assets use independent lookups.'}</p>
   <a className="text-link" href="https://www.geekprotocol.xyz/mint/">Explore GEEK minting ↗</a>
  </article>
 </section>;
}
