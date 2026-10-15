// Check the built public HTML, not just the metadata configuration object.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const html=fs.readFileSync('.next/server/app/index.html','utf8');
const origin='https://wallet.geekprotocol.xyz';
const tags=[...html.matchAll(/<(?:meta|link)\b[^>]*>/g)].map(([tag])=>Object.fromEntries([...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([,key,value])=>[key,value])));
const meta=name=>tags.find(tag=>tag.property===name||tag.name===name)?.content;
assert.equal(new URL(tags.find(tag=>tag.rel==='canonical')?.href).href,`${origin}/`);
assert.equal(new URL(meta('og:url')).href,`${origin}/`);
assert.equal(meta('og:title'),'GEEK Wallet — Kaspa First');
assert.equal(meta('og:type'),'website');
assert.equal(meta('og:image'),`${origin}/share/wallet-v2.png`);
assert.equal(meta('og:image:width'),'1200');assert.equal(meta('og:image:height'),'630');
assert.equal(meta('og:image:type'),'image/png');
assert.ok(meta('og:image:alt')?.includes('Kaspa first.'));
assert.equal(meta('twitter:card'),'summary_large_image');
assert.equal(meta('twitter:image'),meta('og:image'));
assert.equal(meta('twitter:description'),meta('og:description'));
assert.ok(meta('og:description')?.includes('No keys or signing.'));
for(const [file,width,height] of [['public/share/wallet-v2.png',1200,630],['src/app/icon.png',512,512],['src/app/apple-icon.png',180,180]]){
 const png=fs.readFileSync(file);assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 assert.equal(png.readUInt32BE(16),width);assert.equal(png.readUInt32BE(20),height);
}
const ico=fs.readFileSync('src/app/favicon.ico');assert.equal(ico.readUInt16LE(2),1);assert.equal(ico.readUInt16LE(4),3);
assert.ok(tags.some(tag=>tag.rel==='icon'&&tag.href?.startsWith('/icon.png')));
assert.ok(tags.some(tag=>tag.rel==='apple-touch-icon'&&tag.href?.startsWith('/apple-icon.png')));
console.log('Share preview: built canonical, Open Graph, Twitter, image sizes and branded icons verified.');
