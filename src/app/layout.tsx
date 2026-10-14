import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'GEEK Wallet — Kaspa First',description:'Kaspa first: track KAS, featured GEEK, KRC-20 holdings and experimental covenant-token snapshots from a public Mainnet address. No transaction signing.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#track-title">Skip to address tracking</a>{children}</body></html>;}
