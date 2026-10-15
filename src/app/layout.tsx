import type {Metadata} from 'next';
import './globals.css';
const title='GEEK Wallet — Kaspa First';
const description='Track KAS and Kaspa tokens, with GEEK featured. Public-address tracking. No keys or signing.';
const siteUrl='https://wallet.geekprotocol.xyz';
const shareImage={url:`${siteUrl}/share/wallet-v2.png`,width:1200,height:630,type:'image/png',alt:'GEEK Wallet. Kaspa first. Your assets, together. Public-address tracking.'};
export const metadata:Metadata={
 metadataBase:new URL(siteUrl),title,description,applicationName:'GEEK Wallet',
 alternates:{canonical:`${siteUrl}/`},
 openGraph:{type:'website',locale:'en_US',siteName:'GEEK Wallet',url:`${siteUrl}/`,title,description,images:[shareImage]},
 twitter:{card:'summary_large_image',title,description,images:[{url:shareImage.url,alt:shareImage.alt}]},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><a className="skip" href="#track-title">Skip to address tracking</a>{children}</body></html>;}
