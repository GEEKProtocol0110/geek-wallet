// Render static branding at development time; sharing never needs a server render.
// The original GEEK Protocol mark is shared with the protocol HQ.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import sharp from 'sharp';

const logo=await readFile(new URL('../public/brand/geek-protocol-logo.png',import.meta.url));
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
 <defs>
  <radialGradient id="glow"><stop stop-color="#1d5149"/><stop offset="1" stop-color="#0b1216"/></radialGradient>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#83ebc5" stroke-opacity=".05"/></pattern>
 </defs>
 <rect width="1200" height="630" fill="#0b1216"/>
 <ellipse cx="600" cy="240" rx="540" ry="450" fill="url(#glow)"/>
 <rect width="1200" height="630" fill="url(#grid)"/>
 <rect x="32" y="32" width="1136" height="566" rx="28" fill="none" stroke="#29443f"/>
 <g font-family="Arial, Helvetica, sans-serif">
  <text x="490" y="128" fill="#edf7f0" font-size="30" font-weight="700" letter-spacing="2">GEEK <tspan fill="#83ebc5" font-weight="400">// WALLET</tspan></text>
  <text x="600" y="268" fill="#edf7f0" font-size="88" font-weight="700" letter-spacing="-3" text-anchor="middle">Kaspa first.</text>
  <text x="600" y="335" fill="#83ebc5" font-size="48" letter-spacing="-1" text-anchor="middle">Your assets, together.</text>
  <text x="600" y="390" fill="#b0c4c5" font-size="26" text-anchor="middle">KAS + the Kaspa token ecosystem</text>
  <rect x="436" y="423" width="328" height="45" rx="22" fill="#142b27" stroke="#294f44"/>
  <circle cx="461" cy="445" r="5" fill="#83ebc5"/>
  <text x="477" y="454" fill="#c9f5e5" font-size="21">Public-address tracking</text>
  <text x="600" y="538" fill="#edf7f0" font-size="25" text-anchor="middle">wallet.geekprotocol.xyz</text>
  <text x="600" y="576" fill="#b0c4c5" font-size="18" text-anchor="middle">PUBLIC ALPHA · NO KEYS OR SIGNING</text>
 </g>
 <rect x="350" y="48" width="128" height="128" rx="20" fill="#0a0e18" stroke="#315b50"/>
 <image x="354" y="52" width="120" height="120" href="data:image/png;base64,${logo.toString('base64')}"/>
</svg>`;
await mkdir(new URL('../public/share/',import.meta.url),{recursive:true});
await writeFile(new URL('../public/share/wallet-v2.svg',import.meta.url),svg);
await sharp(Buffer.from(svg)).png().toFile(new URL('../public/share/wallet-v2.png',import.meta.url).pathname);
await sharp(logo).resize(512,512).png().toFile(new URL('../src/app/icon.png',import.meta.url).pathname);
await sharp(logo).resize(180,180).png().toFile(new URL('../src/app/apple-icon.png',import.meta.url).pathname);
// ICO entries include standard 16, 32 and 48 px sizes, each encoded as PNG.
const sizes=[16,32,48],images=await Promise.all(sizes.map(size=>sharp(logo).resize(size,size).png().toBuffer()));
const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
let offset=header.length;
for(let i=0;i<sizes.length;i++){
 const entry=6+16*i;header[entry]=sizes[i];header[entry+1]=sizes[i];
 header.writeUInt16LE(1,entry+4);header.writeUInt16LE(32,entry+6);
 header.writeUInt32LE(images[i].length,entry+8);header.writeUInt32LE(offset,entry+12);offset+=images[i].length;
}
await writeFile(new URL('../src/app/favicon.ico',import.meta.url),Buffer.concat([header,...images]));
