import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateSetVolume,
  calculateTotalVolume,
  getPersonalBestWeight,
} from "../src/lib/workout.ts";

describe("workout volume and PR helpers", () => {
  it("calculates single-set and total session volume", () => {
    assert.equal(calculateSetVolume({ reps: 8, weight: 80 }), 640);
    assert.equal(calculateSetVolume({ reps: 0, weight: 80 }), 0);

    const total = calculateTotalVolume([
      { reps: 8, weight: 80 },
      { reps: 8, weight: 85 },
      { reps: 6, weight: 90 },
    ]);
    assert.equal(total, 1860);
  });

  it("finds personal best weight across sets", () => {
    assert.equal(getPersonalBestWeight([]), 0);
    assert.equal(
      getPersonalBestWeight([
        { reps: 10, weight: 60 },
        { reps: 5, weight: 95.5 },
        { reps: 8, weight: 80 },
      ]),
      95.5
    );
  });
});
