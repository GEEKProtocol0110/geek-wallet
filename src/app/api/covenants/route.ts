import {NextRequest,NextResponse} from 'next/server';
import {loadCovenants} from '@/watch/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'},params=request.nextUrl.searchParams;
 if([...params.keys()].some(k=>k!=='address')||params.getAll('address').length!==1)return NextResponse.json({error:'Supply one Mainnet public address.'},{status:400,headers});
 try{return NextResponse.json(await loadCovenants(params.get('address')),{headers});}
 catch{return NextResponse.json({error:'Enter a valid Mainnet public address.'},{status:400,headers});}
}
