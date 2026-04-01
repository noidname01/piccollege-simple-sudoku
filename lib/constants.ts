export const Difficulties = ["easy", "medium", "hard"] as const;

export type Difficulty = (typeof Difficulties)[number];

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};
