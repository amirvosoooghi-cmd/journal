import { NextRequest,NextResponse } from 'next/server';
import { createSession,sessionCookieName,sessionCookieOptions } from '@/lib/auth';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 try{const {code}=await req.json();const expected=process.env.JOURNAL_ACCESS_CODE||'1212';if(typeof code!=='string'||code!==expected)return NextResponse.json({error:'Incorrect access code.'},{status:401});const token=await createSession();const res=NextResponse.json({ok:true});res.cookies.set(sessionCookieName,token,sessionCookieOptions);return res;}catch{return NextResponse.json({error:'Unable to sign in.'},{status:500});}
}
