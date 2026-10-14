const test=require('node:test'),assert=require('node:assert/strict');
const load=require('./load.cjs');
const {parseActivity,normalizeAddress}=load('src/watch/model.ts');
const {acceptance}=load('src/watch/activity.ts');
const address=normalizeAddress('kaspa:qzj0e55rlxpm0knvra9wvgckpkyq9h8hv8wl0lh2ngjad9a4cedmj24cy07ew');
const other=normalizeAddress('kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkx9awp4e');
const input=(amount,at=address,index=0)=>({index,previous_outpoint_amount:amount,previous_outpoint_address:at});
const output=(amount,at=address,index=0)=>({index,amount,script_public_key_address:at});
const receipt=(inputs,outputs,extra={})=>({transaction_id:'a'.repeat(64),is_accepted:true,inputs,outputs,...extra});
const parse=row=>parseActivity([row],address)[0];

test('a spend with same-address change separates recipient outputs, net debit and whole fee',()=>{
 const d=parse(receipt([input('1000000000')],[output('300000000',other),output('699990000',address,1)])).details;
 assert.equal(d.totalInput,'1000000000');assert.equal(d.totalOutput,'999990000');assert.equal(d.fee,'10000');
 assert.equal(d.addressInput,'1000000000');assert.equal(d.addressOutput,'699990000');
 assert.deepEqual(d.change,{direction:'decrease',amount:'300010000'});
 assert.equal(d.outputs[0].address,other);assert.equal(d.outputs[1].address,address);
});

test('an incoming receipt reports only this address increase, not the whole output or someone else fee share',()=>{
 const d=parse(receipt([input('1000000000',other)],[output('100000000'),output('899990000',other,1)])).details;
 assert.deepEqual(d.change,{direction:'increase',amount:'100000000'});assert.equal(d.addressInput,'0');assert.equal(d.fee,'10000');
});

test('self transfers and shared-input spends do not invent a payment recipient or assign the fee',()=>{
 const self=parse(receipt([input('100000000')],[output('99990000')])).details;
 assert.deepEqual(self.change,{direction:'decrease',amount:'10000'});assert.equal(self.fee,'10000');
 const mixed=parse(receipt([input('100000000'),input('200000000',other,1)],[output('50000000'),output('249990000',other,1)])).details;
 assert.equal(mixed.fee,'10000');assert.deepEqual(mixed.change,{direction:'decrease',amount:'50000000'});
 const zero=parse(receipt([input('100000000'),input('10000',other,1)],[output('100000000')])).details;
 assert.deepEqual(zero.change,{direction:'unchanged',amount:'0'});
});

test('one sompi and amounts above JS safe integer precision remain exact',()=>{
 const d=parse(receipt([input('123456789123456789')],[output('123456789123456788')])).details;
 assert.equal(d.fee,'1');assert.deepEqual(d.change,{direction:'decrease',amount:'1'});
 assert.equal(parse(receipt([input(1)],[output(0)])).details.fee,'1');
});

test('missing input resolution keeps outputs visible but never fabricates a fee or net movement',()=>{
 for(const inputs of [undefined,null,[],[input(null)],[input(undefined)],[input('01')],[input(Number.MAX_SAFE_INTEGER+1)],[input(-1)],[input('1e8')]]){
  const d=parse(receipt(inputs,[output('1')])).details;
  assert.equal(d.fee,null);assert.equal(d.change,null);assert.equal(d.outputs[0].amount,'1');
 }
 const unsupported=parse(receipt([input('10',null)],[output('9')])).details;
 assert.equal(unsupported.fee,'1');assert.equal(unsupported.addressInput,null);assert.equal(unsupported.change,null);
});

test('incomplete or contradictory outputs cannot yield invented zero, fees, or address changes',()=>{
 for(const outputs of [undefined,null,[],[output(null)],[output('2')],[output('NaN')]]){
  const d=parse(receipt([input('1')],outputs)).details;assert.equal(d.fee,null);assert.equal(d.change,null);
 }
 const unknown=parse(receipt([input('10')],[output('9','https://attacker.example')])).details;
 assert.equal(unknown.outputs[0].address,null);assert.equal(unknown.addressOutput,null);assert.equal(unknown.change,null);
 assert.equal(unknown.fee,'1');
});

test('duplicate, sparse, invalid and oversized input/output arrays are unavailable instead of summed',()=>{
 for(const rows of [[input('10'),input('10')],[input('10',address,1)],[input('10',address,-1)],[input('10',address,'0')],Array(1001).fill(input('1')),[null]]){
  const d=parse(receipt(rows,[output('1')])).details;assert.equal(d.inputs,null);assert.equal(d.fee,null);assert.equal(d.change,null);
 }
 const d=parse(receipt([input('10')],[output('1'),output('1')])).details;
 assert.equal(d.outputs,null);assert.equal(d.fee,null);assert.equal(d.change,null);
 const sorted=parse(receipt([input('4',address,1),input('6',other,0)],[output('9')])).details;
 assert.deepEqual(sorted.inputs.map(p=>p.index),[0,1]);assert.equal(sorted.fee,'1');
});

test('acceptance false and unknown remain distinct from failure, pending, or verified token payouts',()=>{
 for(const reported of [false,null,'true',1,undefined]){
  const tx=parse(receipt([input('2')],[output('1')],{is_accepted:reported}));
  assert.equal(tx.accepted,typeof reported==='boolean'?reported:null);
  assert.notEqual(acceptance(tx.accepted).label,'Accepted by source');
 }
 assert.equal(acceptance(true).label,'Accepted by source');
 assert.match(acceptance(false).explanation,/does not establish/);
 assert.match(acceptance(null).explanation,/did not report acceptance/);
});

test('timestamps outside the JS date range are unavailable and one malformed detail does not hide other valid receipts',()=>{
 const rows=parseActivity([receipt(null,null,{block_time:9000000000000000}),receipt([input('2')],[output('1')],{transaction_id:'b'.repeat(64),block_time:1700000000000})],address);
 assert.equal(rows[0].time,null);assert.equal(rows[0].details.fee,null);assert.equal(rows[1].details.fee,'1');
});

test('rendered transaction explains exact native values, recipients, unknowns and source-only status',()=>{
 const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
 const TransactionActivity=load('src/app/TransactionActivity.tsx').default;
 const html=renderToStaticMarkup(React.createElement(TransactionActivity,{address,tx:parse(receipt([input('1000000000')],[output('300000000',other),output('699990000',address,1)]))}));
 for(const text of ['3.0001 KAS','0.0001 KAS','KAS · Kaspa Mainnet','Other address · ownership unknown','Tracked address',other,'Recipients &amp; outputs','GEEK is a KRC-20 token','not your current balance'])assert.ok(html.includes(text),text);
 const incomplete=renderToStaticMarkup(React.createElement(TransactionActivity,{address,tx:parse(receipt(undefined,[output('1')],{is_accepted:false}))}));
 for(const text of ['Address change unavailable','Not accepted by source','Fee unavailable','not establish whether it is pending','or a completed payment'])assert.ok(incomplete.includes(text),text);
 assert.ok(!incomplete.includes('Accepted by source'));
});
