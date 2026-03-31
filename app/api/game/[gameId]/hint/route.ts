import { NextRequest, NextResponse } from 'next/server';
import { hint } from '@/lib/gameStore';

export async function POST(_req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;

  const result = hint(gameId);
  if ('error' in result) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json(result);
}
