import {NextRequest,NextResponse} from 'next/server';
import {loadActivity} from '@/watch/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'},p=request.nextUrl.searchParams;
 if([...p.keys()].some(k=>k!=='address')||p.getAll('address').length!==1)return NextResponse.json({error:'Supply one Mainnet public address.'},{status:400,headers});
 try{return NextResponse.json(await loadActivity(p.get('address')),{headers});}
 catch{return NextResponse.json({error:'Enter a valid Kaspa Mainnet public address.'},{status:400,headers});}
}
