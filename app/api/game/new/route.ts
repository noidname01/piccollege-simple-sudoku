import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createGame } from "@/lib/gameStore";
import { Difficulties, Difficulty } from "@/lib/constants";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as { difficulty?: string };
  const { difficulty } = body;

  if (!difficulty || !Difficulties.includes(difficulty as Difficulty)) {
    return NextResponse.json(
      { error: 'Invalid difficulty. Must be "easy", "medium", or "hard".' },
      { status: 400 },
    );
  }

  const { env } = getCloudflareContext();
  const result = await createGame(env.SUDOKU_KV, difficulty as Difficulty);
  return NextResponse.json(result);
}
