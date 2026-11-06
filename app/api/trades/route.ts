import { NextRequest,NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession,sessionCookieName } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/schema';
import { desc } from 'drizzle-orm';
export const runtime='nodejs';
async function authorized(){return verifySession((await cookies()).get(sessionCookieName)?.value);}
export async function GET(){if(!await authorized())return NextResponse.json({error:'Unauthorized'},{status:401});if(!db)return NextResponse.json({error:'Database is not configured'},{status:503});const rows=await db.select().from(trades).orderBy(desc(trades.tradeDate));return NextResponse.json(rows);}
export async function POST(req:NextRequest){if(!await authorized())return NextResponse.json({error:'Unauthorized'},{status:401});if(!db)return NextResponse.json({error:'Database is not configured'},{status:503});const b=await req.json();if(!b.symbol||!b.tradeDate||!['LONG','SHORT'].includes(b.position))return NextResponse.json({error:'Date, symbol and position are required.'},{status:400});const [row]=await db.insert(trades).values({tradeDate:new Date(b.tradeDate),tag:b.tag||null,symbol:String(b.symbol).toUpperCase(),session:b.session||null,move:b.move||null,position:b.position,entry:b.entry||null,riskPct:String(b.riskPct??0.25),pnl:b.pnl===''||b.pnl==null?null:String(b.pnl),rr:b.rr===''||b.rr==null?null:String(b.rr),mfe:b.mfe===''||b.mfe==null?null:String(b.mfe),rangeTime:b.rangeTime||null,breakoutType:b.breakoutType||null,rangeQuality:b.rangeQuality||null,touches:b.touches===''||b.touches==null?null:Number(b.touches),emotions:Array.isArray(b.emotions)?b.emotions:[],notes:b.notes||null}).returning();return NextResponse.json(row,{status:201});}
