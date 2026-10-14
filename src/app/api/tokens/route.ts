import {NextRequest,NextResponse} from 'next/server';
import {loadTokens} from '@/watch/model';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'},params=request.nextUrl.searchParams;
 if([...params.keys()].some(k=>!['address','cursor'].includes(k))||params.getAll('address').length!==1||params.getAll('cursor').length>1)return NextResponse.json({error:'Supply one Mainnet public address and an optional token cursor.'},{status:400,headers});
 try{return NextResponse.json(await loadTokens(params.get('address'),params.get('cursor')),{headers});}
 catch{return NextResponse.json({error:'Enter a valid Mainnet public address and token cursor.'},{status:400,headers});}
}
