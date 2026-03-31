import { NextRequest, NextResponse } from 'next/server';
import { makeMove } from '@/lib/gameStore';

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const body = await req.json();
  const { row, col, value } = body;

  if (typeof row !== 'number' || typeof col !== 'number' || typeof value !== 'number') {
    return NextResponse.json({ error: 'row, col, and value must be numbers.' }, { status: 400 });
  }

  const result = makeMove(gameId, row, col, value);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
