import { NextRequest, NextResponse } from 'next/server';
import { clearCell } from '@/lib/gameStore';

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const body = await req.json();
  const { row, col } = body;

  if (typeof row !== 'number' || typeof col !== 'number') {
    return NextResponse.json({ error: 'row and col must be numbers.' }, { status: 400 });
  }

  const result = clearCell(gameId, row, col);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
