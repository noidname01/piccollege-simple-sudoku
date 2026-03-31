import axios from "axios";
import { Difficulty } from "@/lib/constants";
import type { LeaderboardEntry } from "@/lib/config";

export interface NewGameResponse {
  gameId: string;
  puzzle: number[][];
  difficulty: Difficulty;
}

export interface MoveResponse {
  valid: boolean;
  completed?: boolean;
  finalTime?: number;
  penalty?: number;
  totalPenalty?: number;
}

export interface ClearResponse {
  success: boolean;
}

export interface GameStateResponse {
  gameId: string;
  board: number[][];
  difficulty: Difficulty;
  elapsedTime: number;
  totalPenalty: number;
  completed: boolean;
}

const api = axios.create({ baseURL: "/api/game" });

export function createGame(difficulty: Difficulty) {
  return api
    .post<NewGameResponse>("/new", { difficulty })
    .then((res) => res.data);
}

export function makeMove(
  gameId: string,
  row: number,
  col: number,
  value: number,
) {
  return api
    .post<MoveResponse>(`/${gameId}/move`, { row, col, value })
    .then((res) => res.data);
}

export function clearCell(gameId: string, row: number, col: number) {
  return api
    .post<ClearResponse>(`/${gameId}/clear`, { row, col })
    .then((res) => res.data);
}

export function getGameState(gameId: string) {
  return api.get<GameStateResponse>(`/${gameId}/state`).then((res) => res.data);
}

export interface UndoRedoResponse {
  success: boolean;
  row: number;
  col: number;
  value: number;
}

export function undoMove(gameId: string) {
  return api.post<UndoRedoResponse>(`/${gameId}/undo`).then((res) => res.data);
}

export function redoMove(gameId: string) {
  return api.post<UndoRedoResponse>(`/${gameId}/redo`).then((res) => res.data);
}

export interface HintResponse {
  row: number;
  col: number;
  value: number;
  penalty: number;
  totalPenalty: number;
  completed: boolean;
  finalTime?: number;
}

export function getHint(gameId: string) {
  return api.post<HintResponse>(`/${gameId}/hint`).then((res) => res.data);
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
}

export function getLeaderboard(difficulty?: Difficulty) {
  const params = difficulty ? { difficulty } : {};
  return api
    .get<LeaderboardResponse>("/leaderboard", { params })
    .then((res) => res.data.entries);
}
