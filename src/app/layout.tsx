import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'GEEK Wallet — Kaspa Portfolio Companion',description:'Track a public Kaspa Mainnet address: KAS and GEEK balances, recent activity and a receiving QR. No recovery phrases or transaction signing.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#track-title">Skip to address tracking</a>{children}</body></html>;}
