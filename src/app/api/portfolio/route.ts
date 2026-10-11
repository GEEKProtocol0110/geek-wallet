import {NextRequest,NextResponse} from 'next/server';
import {loadPortfolio} from '@/watch/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest) {
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
 const params=request.nextUrl.searchParams;
 if([...params.keys()].some(k=>k!=='address') || params.getAll('address').length!==1) return NextResponse.json({error:'Supply one Mainnet public address.'},{status:400,headers});
 try{return NextResponse.json(await loadPortfolio(params.get('address')),{headers});}
 catch{return NextResponse.json({error:'Enter a valid Kaspa Mainnet public address.'},{status:400,headers});}
}
