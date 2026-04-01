import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { redo } from "@/lib/gameStore";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  const { gameId } = await params;

  const { env } = getCloudflareContext();
  const result = await redo(env.SUDOKU_KV, gameId);
  if ("error" in result) {
    return NextResponse.json(
      { error: result.error },
      { status: result.status },
    );
  }

  return NextResponse.json(result);
}
