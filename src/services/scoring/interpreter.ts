import type { ScoreLabel, ScoreColor } from "@/types/scoring";

export function interpretScore(
  finalScore: number,
): { label: ScoreLabel; color: ScoreColor } {
  if (finalScore >= 80) return { label: "Excellent", color: "green" };
  if (finalScore >= 60) return { label: "Good", color: "yellow-green" };
  if (finalScore >= 40) return { label: "Average", color: "yellow" };
  if (finalScore >= 20) return { label: "Poor", color: "orange" };
  return { label: "Very Poor", color: "red" };
}
