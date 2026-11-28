import { isValidVideoUrl } from "./video.ts";

export interface RoutineExerciseSummaryInput {
  order: number;
  sets: number | null;
  reps: number | null;
  videoUrl?: string | null;
}

export interface RoutineSummary {
  totalExercises: number;
  totalSets: number;
  withVideoCount: number;
}

export function sortRoutineExercises<T extends { order: number }>(
  exercises: readonly T[]
): T[] {
  return [...exercises].sort((a, b) => a.order - b.order);
}

export function summarizeRoutine(
  exercises: readonly RoutineExerciseSummaryInput[]
): RoutineSummary {
  let totalSets = 0;
  let withVideoCount = 0;

  for (const item of exercises) {
    if (item.sets && item.sets > 0) {
      totalSets += item.sets;
    }
    if (isValidVideoUrl(item.videoUrl)) {
      withVideoCount += 1;
    }
  }

  return {
    totalExercises: exercises.length,
    totalSets,
    withVideoCount,
  };
}
