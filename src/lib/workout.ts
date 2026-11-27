export interface WorkoutSetEntry {
  reps: number;
  weight: number;
}

export function calculateSetVolume(set: WorkoutSetEntry): number {
  if (set.reps <= 0 || set.weight < 0) return 0;
  return Number((set.reps * set.weight).toFixed(2));
}

export function calculateTotalVolume(sets: readonly WorkoutSetEntry[]): number {
  const total = sets.reduce((acc, set) => acc + calculateSetVolume(set), 0);
  return Number(total.toFixed(2));
}

export function getPersonalBestWeight(sets: readonly WorkoutSetEntry[]): number {
  if (sets.length === 0) return 0;
  return sets.reduce((max, set) => (set.weight > max ? set.weight : max), 0);
}
