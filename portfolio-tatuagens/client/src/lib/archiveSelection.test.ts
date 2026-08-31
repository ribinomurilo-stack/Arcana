import { describe, expect, it } from "vitest";
import { ARCHIVE_SELECTION_ANCHOR, ARCHIVE_SELECTION_ROTATION_MS, ARCHIVE_SELECTION_SIZE, getActiveArchiveSelection, getArchiveSelectionCountdown } from "./archiveSelection";

const drawings = Array.from({ length: 20 }, (_, index) => ({ id: `drawing-${index}`, category: `category-${index}`, url: `/drawing-${index}.jpg`, width: 100, height: 100, status: "Disponível" as const, addedAt: index }));

describe("archiveSelection", () => {
  it("returns ten drawings and changes the set after four days", () => {
    const first = getActiveArchiveSelection(drawings, ARCHIVE_SELECTION_ANCHOR);
    const next = getActiveArchiveSelection(drawings, ARCHIVE_SELECTION_ANCHOR + ARCHIVE_SELECTION_ROTATION_MS);
    expect(ARCHIVE_SELECTION_SIZE).toBe(10);
    expect(first).toHaveLength(10);
    expect(next).toHaveLength(10);
    expect(next[0].id).not.toBe(first[0].id);
  });

  it("counts down to the next four-day rotation", () => {
    expect(getArchiveSelectionCountdown(ARCHIVE_SELECTION_ANCHOR + 1_000)).toMatchObject({ days: 3, hours: 23, minutes: 59, seconds: 59 });
  });
});
