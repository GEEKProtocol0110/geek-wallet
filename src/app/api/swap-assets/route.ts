import {NextRequest,NextResponse} from 'next/server';
import {loadSwapListings} from '@/swaps/catalog';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export async function GET(request:NextRequest){
 const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer'};
 if(request.nextUrl.search)return NextResponse.json({error:'No parameters are accepted.'},{status:400,headers});
 return NextResponse.json(await loadSwapListings(),{headers});
}
