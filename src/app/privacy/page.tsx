import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy | GEEK Wallet',
  description: 'GEEK Wallet tracks public Kaspa addresses. No keys, signing, accounts or analytics. Saved addresses stay in your browser.',
  alternates: { canonical: 'https://wallet.geekprotocol.xyz/privacy' },
};

export default function PrivacyPage() {
  return <><header className="header"><Link className="brand" href="/">GEEK<span>{'// WALLET'}</span></Link><nav aria-label="Main navigation"><Link href="/">← Portfolio</Link><a href="https://www.geekprotocol.xyz/">HQ ↗</a></nav></header>
  <main id="privacy-title"><section className="next">
    <h1>Privacy</h1>
    <p>Effective November 19, 2026. GEEK Wallet is a public Alpha, read-only portfolio companion from Geek Protocol. It never asks for, receives or stores a seed phrase, private key or signature, and it cannot move funds. There are no accounts, ads or analytics.</p>
    <h2>Addresses you look up</h2>
    <p>When you enter a public Kaspa address, our server looks up its balances, tokens and activity from public sources: the Kaspa REST API (api.kaspa.org), Kasplex (api.kasplex.org) and kcc20.info. Those services receive the address and may keep their own logs. Responses are not cached, and we do not keep a list of looked-up addresses. Remember that everything on a public blockchain is visible to anyone.</p>
    <h2>Saved addresses</h2>
    <p>Addresses you choose to keep are saved only in this browser&apos;s local storage. Remove them in the app or by clearing this site&apos;s data.</p>
    <h2>Swaps</h2>
    <p>The <Link href="/swap">Swap</Link> page only links to ChangeNOW. Any exchange happens on ChangeNOW under its terms and privacy policy, which may include identity checks. GEEK Wallet sends it nothing about you and receives no commission.</p>
    <h2>Hosting</h2>
    <p>The site is hosted on Vercel, which receives standard request details such as your IP address.</p>
    <h2>Contact</h2>
    <p>Questions: email <strong>geek.coin.protocol@gmail.com</strong>. See also the <a href="https://www.geekprotocol.xyz/privacy/">Geek Protocol HQ privacy notice</a>.</p>
  </section></main>
  <footer>GEEK Wallet · Kaspa first · Read-only. No keys, signing or custody.</footer></>;
}
