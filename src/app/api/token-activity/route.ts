import {NextRequest,NextResponse} from 'next/server';
import {loadTokenActivity} from '@/watch/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'},p=request.nextUrl.searchParams;
 if([...p.keys()].some(k=>!['address','ticker','cursor'].includes(k))||p.getAll('address').length!==1||p.getAll('ticker').length!==1||p.getAll('cursor').length>1)return NextResponse.json({error:'Supply one address, ticker and optional cursor.'},{status:400,headers});
 try{return NextResponse.json(await loadTokenActivity(p.get('address'),p.get('ticker'),p.get('cursor')),{headers});}
 catch{return NextResponse.json({error:'Invalid Mainnet address, ticker or cursor.'},{status:400,headers});}
}
