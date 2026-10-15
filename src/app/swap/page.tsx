import type {Metadata} from 'next';
import Link from 'next/link';
import SwapPicker from './SwapPicker';
export const metadata:Metadata={title:'Swap routes | GEEK Wallet',description:'Explore KAS swaps with ten major crypto assets through an external provider.',alternates:{canonical:'https://wallet.geekprotocol.xyz/swap'}};
export default function SwapPage(){
 return <><header className="header"><Link className="brand" href="/">GEEK<span>{'// WALLET'}</span></Link><nav aria-label="Main navigation"><Link href="/">← Portfolio</Link><a href="https://www.geekprotocol.xyz/">HQ ↗</a></nav></header><main id="track-title">
  <section className="hero"><span className="eyebrow">KASPA FIRST · EXTERNAL SWAP PROVIDER</span><h1>KAS meets<br/><em>major crypto.</em></h1><p>Choose from ten major assets and review the exchange on ChangeNOW. Your existing wallet sends the funds; GEEK Wallet tracks public addresses.</p><div className="pill">External provider · No in-wallet execution</div></section>
  <SwapPicker/>
  <section className="next"><h2>Review before you exchange</h2><p>ChangeNOW sets the live quote, minimum amount, fees, destination details and availability. Rates may change; check the exact receiving network and any required memo or destination tag on its review screen.</p><p>Provider eligibility and identity checks apply. ChangeNOW documents a registered/verified-user route for supported US states, including Michigan. Its own eligibility decision controls access.</p><p>GEEK, other KRC-20 tokens and covenant tokens are not included in these swap routes. The Kaspa receiving QR does not receive BTC, ETH or stablecoins on other networks.</p><p>Opening the provider creates no order here and shares no tracked address or nickname. Provider quotes and final transaction status are handled on ChangeNOW.</p><a href="https://changenow.io/terms-of-use/changenow-pro" target="_blank" rel="noopener noreferrer">Provider eligibility & terms ↗</a><Link href="/">Back to your Kaspa portfolio →</Link></section>
 </main><footer>GEEK Wallet · Kaspa first · External swap discovery. No exchange order, custody or signing in GEEK Wallet.</footer></>;
}
