import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { verifySession, sessionCookieName } from '@/lib/auth';
import { db } from '@/lib/db';
import { trades } from '@/lib/schema';

export const runtime = 'nodejs';

type Context = {
  params: Promise<{ id: string }>;
};

async function authorized() {
  const cookie = (await cookies()).get(sessionCookieName)?.value;
  return verifySession(cookie);
}

export async function PUT(req: NextRequest, { params }: Context) {
  if (!await authorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json(
      { error: 'Database is not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const tradeId = Number(id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    return NextResponse.json({ error: 'Invalid trade ID' }, { status: 400 });
  }

  const b = await req.json();

  if (!b.symbol || !b.tradeDate || !['LONG', 'SHORT'].includes(b.position)) {
    return NextResponse.json(
      { error: 'Date, symbol and position are required.' },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(trades)
    .set({
      tradeDate: new Date(b.tradeDate),
      tag: b.tag || null,
      symbol: String(b.symbol).toUpperCase(),
      session: b.session || null,
      move: b.move || null,
      position: b.position,
      entry: b.entry || null,
      riskPct: String(b.riskPct ?? 0.25),
      pnl: b.pnl === '' || b.pnl == null ? null : String(b.pnl),
      rr: b.rr === '' || b.rr == null ? null : String(b.rr),
      mfe: b.mfe === '' || b.mfe == null ? null : String(b.mfe),
      rangeTime: b.rangeTime || null,
      breakoutType: b.breakoutType || null,
      rangeQuality: b.rangeQuality || null,
      touches: b.touches === '' || b.touches == null
        ? null
        : Number(b.touches),
      emotions: Array.isArray(b.emotions) ? b.emotions : [],
      notes: b.notes || null,
      updatedAt: new Date(),
    })
    .where(eq(trades.id, tradeId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Context) {
  if (!await authorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!db) {
    return NextResponse.json(
      { error: 'Database is not configured' },
      { status: 503 }
    );
  }

  const { id } = await params;
  const tradeId = Number(id);

  if (!Number.isInteger(tradeId) || tradeId < 1) {
    return NextResponse.json({ error: 'Invalid trade ID' }, { status: 400 });
  }

  const [deleted] = await db
    .delete(trades)
    .where(eq(trades.id, tradeId))
    .returning({ id: trades.id });

  if (!deleted) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}