import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sortRoutineExercises, summarizeRoutine } from "../src/lib/routine.ts";

describe("routine ordering and summary helpers", () => {
  it("sorts routine exercises by ascending order without mutating input", () => {
    const input = [
      { id: "c", order: 3, sets: 3, reps: 12 },
      { id: "a", order: 1, sets: 4, reps: 8 },
      { id: "b", order: 2, sets: 3, reps: 10 },
    ];
    const sorted = sortRoutineExercises(input);
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["a", "b", "c"]
    );
    assert.equal(input[0].id, "c");
  });

  it("summarizes exercise count, total sets, and valid video count", () => {
    const summary = summarizeRoutine([
      { order: 1, sets: 4, reps: 8, videoUrl: "https://youtu.be/abc123" },
      { order: 2, sets: 3, reps: 10, videoUrl: "javascript:alert(1)" },
      { order: 3, sets: null, reps: 15, videoUrl: "https://vimeo.com/999" },
    ]);
    assert.deepEqual(summary, {
      totalExercises: 3,
      totalSets: 7,
      withVideoCount: 2,
    });
  });
});
