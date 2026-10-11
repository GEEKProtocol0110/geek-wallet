import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({error:'Price history is not provided by this portfolio release.'},{status:503,headers:{'Cache-Control':'no-store'}});}
