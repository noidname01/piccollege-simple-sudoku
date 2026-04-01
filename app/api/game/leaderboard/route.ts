import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getLeaderboard } from "@/lib/gameStore";
import { Difficulties, Difficulty } from "@/lib/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const difficulty = searchParams.get("difficulty") as Difficulty | null;

  if (difficulty && !Difficulties.includes(difficulty)) {
    return NextResponse.json(
      { error: 'Invalid difficulty. Must be "easy", "medium", or "hard".' },
      { status: 400 },
    );
  }

  const { env } = getCloudflareContext();
  const entries = await getLeaderboard(env.SUDOKU_KV, difficulty ?? undefined);
  return NextResponse.json({ entries });
}
