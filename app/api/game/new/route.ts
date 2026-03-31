import { NextRequest, NextResponse } from 'next/server';
import { createGame } from '@/lib/gameStore';
import { Difficulty } from '@/lib/constants';

const VALID_DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard'];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { difficulty } = body;

  if (!difficulty || !VALID_DIFFICULTIES.includes(difficulty)) {
    return NextResponse.json(
      { error: 'Invalid difficulty. Must be "easy", "medium", or "hard".' },
      { status: 400 }
    );
  }

  const result = createGame(difficulty);
  return NextResponse.json(result);
}
