import { NextRequest, NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getLeaderboard } from '@/lib/gameStore';
import { Difficulty } from '@/lib/constants';

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const difficulty = searchParams.get('difficulty') as Difficulty | null;

  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
    return NextResponse.json(
      { error: 'Invalid difficulty. Must be "easy", "medium", or "hard".' },
      { status: 400 }
    );
  }

  const { env } = getCloudflareContext();
  const entries = await getLeaderboard(env.SUDOKU_KV, difficulty ?? undefined);
  return NextResponse.json({ entries });
}